import { type NextRequest, NextResponse } from "next/server"
import { ytDlpDownloader } from "@/lib/yt-dlp"

export const dynamic = "force-dynamic"

// Store active downloads to track progress
const activeDownloads = new Map<string, { progress: number; status: string }>()

export async function POST(request: NextRequest) {
  try {
    const { url, quality, format, downloadId } = await request.json()

    if (!url || !quality) {
      return NextResponse.json({ error: "URL and quality are required" }, { status: 400 })
    }

    const id = downloadId || Date.now().toString()

    // Initialize download tracking
    activeDownloads.set(id, { progress: 0, status: "starting" })

    try {
      // Start the download
      const result = await ytDlpDownloader.downloadVideo({
        url,
        quality,
        format: format || "mp4",
        onProgress: (progress) => {
          activeDownloads.set(id, { progress, status: "downloading" })
        },
      })

      if (result.success && result.filePath) {
        activeDownloads.set(id, { progress: 100, status: "completed" })

        return NextResponse.json({
          success: true,
          downloadId: id,
          fileName: result.fileName,
          fileSize: result.fileSize,
          downloadUrl: `/api/download/file?id=${id}&file=${encodeURIComponent(result.fileName || "")}`,
        })
      } else {
        activeDownloads.delete(id)
        return NextResponse.json(
          {
            success: false,
            error: result.error || "Download failed",
          },
          { status: 500 },
        )
      }
    } catch (error) {
      activeDownloads.delete(id)
      return NextResponse.json(
        {
          success: false,
          error: `Download error: ${error}`,
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("Error processing download:", error)
    return NextResponse.json({ error: "Download failed" }, { status: 500 })
  }
}

// Get download progress
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const downloadId = searchParams.get("id")

  if (!downloadId) {
    return NextResponse.json({ error: "Download ID required" }, { status: 400 })
  }

  const download = activeDownloads.get(downloadId)
  if (!download) {
    return NextResponse.json({ error: "Download not found" }, { status: 404 })
  }

  return NextResponse.json(download)
}
