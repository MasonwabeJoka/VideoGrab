import { NextRequest, NextResponse } from "next/server";
import { YtDlpDownloader } from "@/lib/yt-dlp";

const ytDlpDownloader = new YtDlpDownloader();

export async function GET(request: NextRequest) {
  try {
    const proxyStatus = ytDlpDownloader.getProxyStatus();
    const activeDownloads = ytDlpDownloader.getActiveDownloads();
    
    return NextResponse.json({
      success: true,
      data: {
        proxy: proxyStatus,
        downloads: {
          active: activeDownloads,
          maxConcurrent: parseInt(process.env.MAX_CONCURRENT_DOWNLOADS || "3"),
        },
        rateLimit: {
          interval: parseInt(process.env.MIN_REQUEST_INTERVAL || "2000"),
        },
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getting status:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to get system status",
      },
      { status: 500 }
    );
  }
}
