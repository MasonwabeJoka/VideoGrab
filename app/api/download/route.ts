import { type NextRequest, NextResponse } from "next/server";
import { ytDlpDownloader } from "@/lib/yt-dlp";
import Pusher from "pusher";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// Initialize Pusher
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.PUSHER_CLUSTER!,
  useTLS: true,
});

// Store active downloads to track progress
const activeDownloads = new Map<string, { progress: number; status: string }>();

export async function POST(request: NextRequest) {
  try {
    const { url, quality, format, downloadId } = await request.json();

    if (!url || !quality) {
      return NextResponse.json({ error: "URL and quality are required" }, { status: 400 });
    }

    const id = downloadId || randomUUID();

    // Initialize download tracking
    activeDownloads.set(id, { progress: 0, status: "starting" });

    // Trigger Pusher event for initial status
    await pusher.trigger(`download-${id}`, "progress-update", {
      progress: 0,
      status: "starting",
    });

    // Start the download
    ytDlpDownloader
      .downloadVideo({
        url,
        quality,
        format: format || "mp4",
        onProgress: async (progress) => {
          activeDownloads.set(id, { progress, status: "downloading" });
          // Trigger Pusher event for progress
          await pusher.trigger(`download-${id}`, "progress-update", {
            progress,
            status: "downloading",
          });
        },
      })
      .then(async (result) => {
        if (result.success && result.filePath) {
          activeDownloads.set(id, { progress: 100, status: "completed" });
          // Trigger Pusher event for completion
          await pusher.trigger(`download-${id}`, "progress-update", {
            progress: 100,
            status: "completed",
            fileName: result.fileName,
            fileSize: result.fileSize,
            downloadUrl: `/api/download/file?id=${id}&file=${encodeURIComponent(result.fileName || "")}`,
          });
        } else {
          activeDownloads.set(id, { progress: 0, status: "failed" });
          await pusher.trigger(`download-${id}`, "progress-update", {
            progress: 0,
            status: "failed",
            error: result.error || "Download failed",
          });
        }
      })
      .catch(async (error) => {
        activeDownloads.set(id, { progress: 0, status: "failed" });
        await pusher.trigger(`download-${id}`, "progress-update", {
          progress: 0,
          status: "failed",
          error: `Download error: ${error.message}`,
        });
      });

    return NextResponse.json({ success: true, downloadId: id });
  } catch (error) {
    console.error("Error processing download:", error);
    return NextResponse.json({ error: "Download failed" }, { status: 500 });
  }
}

// Get download progress (optional fallback for non-Pusher clients)
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const downloadId = searchParams.get("id");

  if (!downloadId) {
    return NextResponse.json({ error: "Download ID required" }, { status: 400 });
  }

  const download = activeDownloads.get(downloadId);
  if (!download) {
    return NextResponse.json({ error: "Download not found" }, { status: 404 });
  }

  return NextResponse.json(download);
}