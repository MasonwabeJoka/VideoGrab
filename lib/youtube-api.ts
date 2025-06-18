import type { VideoInfo, DownloadRequest, DownloadResponse } from "@/types/video"

// Mock API functions - replace with actual backend implementation
export async function getVideoInfo(url: string): Promise<VideoInfo | null> {
  try {
    // In real implementation, this would call your backend API
    // which would use youtube-dl, yt-dlp, or similar tool
    const response = await fetch("/api/video-info", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ url }),
    })

    if (!response.ok) {
      throw new Error("Failed to fetch video info")
    }

    return await response.json()
  } catch (error) {
    console.error("Error fetching video info:", error)
    return null
  }
}

export async function downloadVideo(request: DownloadRequest): Promise<DownloadResponse> {
  try {
    // In real implementation, this would call your backend API
    const response = await fetch("/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error("Download failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Error downloading video:", error)
    return {
      success: false,
      error: "Download failed. Please try again.",
    }
  }
}

export function isValidYouTubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/
  return youtubeRegex.test(url)
}

export function extractVideoId(url: string): string | null {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}
