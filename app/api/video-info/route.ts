import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

export const dynamic = "force-dynamic"

// YouTube Data API v3 - you'll need to set YOUTUBE_API_KEY in your environment
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

async function getVideoFormatsWithYtDlp(url: string): Promise<any> {
  return new Promise((resolve, reject) => {
    const ytDlp = spawn("python", ["-m", "yt_dlp", "--list-formats", "--dump-json", url], {
      stdio: ["pipe", "pipe", "pipe"],
    })

    let stdout = ""
    let stderr = ""

    ytDlp.stdout.on("data", (data) => {
      stdout += data.toString()
    })

    ytDlp.stderr.on("data", (data) => {
      stderr += data.toString()
    })

    ytDlp.on("close", (code) => {
      if (code === 0) {
        try {
          // Parse the JSON output - yt-dlp outputs one JSON object per line
          const lines = stdout.trim().split('\n')
          const videoInfo = JSON.parse(lines[lines.length - 1]) // Last line contains the video info
          resolve(videoInfo)
        } catch (error) {
          console.error("Error parsing yt-dlp output:", error)
          reject(new Error("Failed to parse video information"))
        }
      } else {
        console.error("yt-dlp error:", stderr)
        reject(new Error("Failed to fetch video information"))
      }
    })
  })
}

function extractAvailableQualities(formats: any[]): Array<{quality: string, format: string, size: string}> {
  const videoFormats = formats.filter(fmt =>
    fmt.vcodec !== 'none' &&
    fmt.height &&
    fmt.ext === 'mp4' &&
    !fmt.format_note?.includes('storyboard')
  )

  // Group by height and get the best format for each resolution
  const qualityMap = new Map()

  videoFormats.forEach(fmt => {
    const height = fmt.height
    const quality = `${height}p`

    if (!qualityMap.has(quality) ||
        (fmt.vcodec?.includes('avc1') && !qualityMap.get(quality).vcodec?.includes('avc1'))) {
      qualityMap.set(quality, {
        quality,
        format: fmt.ext,
        size: fmt.filesize ? `~${Math.round(fmt.filesize / 1024 / 1024)}MB` : "Unknown",
        height: fmt.height
      })
    }
  })

  // Sort by height descending and return
  return Array.from(qualityMap.values())
    .sort((a, b) => b.height - a.height)
    .map(({ height, ...rest }) => rest)
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Basic YouTube URL validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
    if (!youtubeRegex.test(url)) {
      return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 })
    }

    // Extract video ID
    const videoIdMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)
    if (!videoIdMatch) {
      return NextResponse.json({ error: "Could not extract video ID" }, { status: 400 })
    }

    const videoId = videoIdMatch[1]

    try {
      // Get real video information using yt-dlp
      const videoInfo = await getVideoFormatsWithYtDlp(url)
      const availableQualities = extractAvailableQualities(videoInfo.formats || [])

      // Parse duration from seconds to readable format
      const duration = videoInfo.duration ? formatDuration(videoInfo.duration) : "N/A"

      const result = {
        id: videoId,
        title: videoInfo.title || "YouTube Video",
        description: videoInfo.description || "",
        thumbnail: videoInfo.thumbnail || `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        duration: duration,
        length: duration,
        highestQuality: availableQualities[0]?.quality || "1080p",
        availableQualities: availableQualities.length > 0 ? availableQualities : [
          { quality: "1080p", format: "mp4", size: "~150MB" },
          { quality: "720p", format: "mp4", size: "~80MB" },
          { quality: "480p", format: "mp4", size: "~40MB" },
          { quality: "360p", format: "mp4", size: "~25MB" },
        ],
      }

      return NextResponse.json(result)
    } catch (ytDlpError) {
      console.error("yt-dlp failed, falling back to YouTube API or mock data:", ytDlpError)

      // If YouTube API key is available, fetch basic data
      if (YOUTUBE_API_KEY) {
        try {
          const response = await fetch(
            `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,statistics,contentDetails`,
          )

          const data = await response.json()

          if (data.items && data.items.length > 0) {
            const video = data.items[0]
            const snippet = video.snippet
            const contentDetails = video.contentDetails

            // Parse duration from ISO 8601 format (PT4M13S -> 4:13)
            const duration = parseDuration(contentDetails.duration)

            return NextResponse.json({
              id: videoId,
              title: snippet.title,
              description: snippet.description,
              thumbnail: snippet.thumbnails.maxres?.url || snippet.thumbnails.high?.url || snippet.thumbnails.medium?.url,
              duration: duration,
              length: duration,
              highestQuality: "1080p",
              availableQualities: [
                { quality: "1080p", format: "mp4", size: "~150MB" },
                { quality: "720p", format: "mp4", size: "~80MB" },
                { quality: "480p", format: "mp4", size: "~40MB" },
                { quality: "360p", format: "mp4", size: "~25MB" },
              ],
            })
          }
        } catch (apiError) {
          console.error("YouTube API error:", apiError)
        }
      }

      // Final fallback: Return basic data with real thumbnail
      const mockVideoInfo = {
        id: videoId,
        title: "YouTube Video",
        description: "Video information could not be fetched.",
        thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        duration: "N/A",
        length: "N/A",
        highestQuality: "1080p",
        availableQualities: [
          { quality: "1080p", format: "mp4", size: "~150MB" },
          { quality: "720p", format: "mp4", size: "~80MB" },
          { quality: "480p", format: "mp4", size: "~40MB" },
          { quality: "360p", format: "mp4", size: "~25MB" },
        ],
      }

      return NextResponse.json(mockVideoInfo)
    }
  } catch (error) {
    console.error("Error processing video info:", error)
    return NextResponse.json({ error: "Failed to process video" }, { status: 500 })
  }
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }
  return `${minutes}:${secs.toString().padStart(2, "0")}`
}

function parseDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)
  if (!match) return "0:00"

  const hours = Number.parseInt(match[1] || "0")
  const minutes = Number.parseInt(match[2] || "0")
  const seconds = Number.parseInt(match[3] || "0")

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M"
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K"
  }
  return num.toString()
}
