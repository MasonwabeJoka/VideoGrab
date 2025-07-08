import { type NextRequest, NextResponse } from "next/server";
import { ytDlpDownloader } from "@/lib/yt-dlp";
import { randomUUID } from "crypto";

export const dynamic = "force-dynamic";

// Store active downloads to track progress
const activeDownloads = new Map<string, { status: string; fileName?: string; fileSize?: number; error?: string; actualQuality?: string; videoOnly?: boolean }>();

export async function POST(request: NextRequest) {
  try {
    const { url, quality, format, downloadId, title } = await request.json();
    if (!url || !quality) {
      return NextResponse.json({ error: "URL and quality are required" }, { status: 400 });
    }
    const id = downloadId || randomUUID();
    activeDownloads.set(id, { status: "processing" });
    // Try download
    let result = await ytDlpDownloader.downloadVideo({ url, quality, format: format || "mp4", title });
    if (result.fallback && !result.success) {
      // Notify frontend about fallback, then try again with next lower quality
      // (Frontend will poll and see the new status)
      activeDownloads.set(id, { status: "failed", error: result.error });
      // Try again with next lower quality (do not notify again)
      result = await ytDlpDownloader.downloadVideo({ url, quality: result.attemptedQualities[result.attemptedQualities.length-1], format: format || "mp4", title });
    }
    if (result.success && result.filePath) {
      activeDownloads.set(id, { status: "completed", fileName: result.fileName, fileSize: result.fileSize, actualQuality: result.actualQuality, videoOnly: result.videoOnly });
    } else if (!result.success) {
      // Enhanced error message with proxy suggestions
      let enhancedError = result.error;
      const proxyStatus = ytDlpDownloader.getProxyStatus();

      if (result.error?.includes("blocking") || result.error?.includes("403") || result.error?.includes("429")) {
        if (!proxyStatus.configured) {
          enhancedError += " Consider configuring proxies in your environment variables (PROXY_LIST) to avoid IP blocking.";
        } else {
          enhancedError += " Try updating your cookies.txt file or using different proxy servers.";
        }
      }

      activeDownloads.set(id, { status: "failed", error: enhancedError });
    }
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