import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic" 

// YouTube Data API v3 - you'll need to set YOUTUBE_API_KEY in your environment
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY

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

    // If YouTube API key is available, fetch real data
    if (YOUTUBE_API_KEY) {
      try {
        const response = await fetch(
          `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=${YOUTUBE_API_KEY}&part=snippet,statistics,contentDetails`,
        )

        const data = await response.json()

        if (data.items && data.items.length > 0) {
          const video = data.items[0]
          const snippet = video.snippet
          const statistics = video.statistics
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
            highestQuality: "2160p",
            availableQualities: [
              { quality: "2160p", format: "mp4", size: "~500MB" },
              { quality: "1440p", format: "mp4", size: "~300MB" },
              { quality: "1080p", format: "mp4", size: "~150MB" },
              { quality: "720p", format: "mp4", size: "~80MB" },
              { quality: "480p", format: "mp4", size: "~40MB" },
              { quality: "360p", format: "mp4", size: "~25MB" },
            ],
          })
        }
      } catch (apiError) {
        console.error("YouTube API error:", apiError)
        // Fall back to basic data if API fails
      }
    }

    // Fallback: Return basic data with real thumbnail
    const mockVideoInfo = {
      id: videoId,
      title: "YouTube Video (API key required for full details)",
      description: "Set YOUTUBE_API_KEY environment variable to fetch full video details.",
      thumbnail: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
      duration: "N/A",
      length: "N/A",
      highestQuality: "2160p",
      availableQualities: [
        { quality: "2160p", format: "mp4", size: "~500MB" },
        { quality: "1440p", format: "mp4", size: "~300MB" },
        { quality: "1080p", format: "mp4", size: "~150MB" },
        { quality: "720p", format: "mp4", size: "~80MB" },
        { quality: "480p", format: "mp4", size: "~40MB" },
        { quality: "360p", format: "mp4", size: "~25MB" },
      ],
    }

    return NextResponse.json(mockVideoInfo)
  } catch (error) {
    console.error("Error processing video info:", error)
    return NextResponse.json({ error: "Failed to process video" }, { status: 500 })
  }
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
