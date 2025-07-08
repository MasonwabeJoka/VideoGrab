import { NextRequest, NextResponse } from "next/server";
import { YtDlpDownloader } from "@/lib/yt-dlp";
import { spawn } from "child_process";

const ytDlpDownloader = new YtDlpDownloader();

export async function GET(request: NextRequest) {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      server: {
        platform: process.platform,
        nodeVersion: process.version,
        environment: process.env.NODE_ENV,
      },
      proxy: ytDlpDownloader.getProxyStatus(),
      downloads: {
        active: ytDlpDownloader.getActiveDownloads(),
        maxConcurrent: parseInt(process.env.MAX_CONCURRENT_DOWNLOADS || "3"),
      },
      rateLimit: {
        interval: parseInt(process.env.MIN_REQUEST_INTERVAL || "2000"),
      },
      ytDlp: await checkYtDlpVersion(),
      network: await checkNetworkConnectivity(),
      cookies: await checkCookiesFile(),
    };

    return NextResponse.json({
      success: true,
      diagnostics,
      recommendations: generateRecommendations(diagnostics),
    });
  } catch (error) {
    console.error("Error running diagnostics:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to run diagnostics",
      },
      { status: 500 }
    );
  }
}

async function checkYtDlpVersion(): Promise<any> {
  return new Promise((resolve) => {
    const ytDlp = spawn("python", ["-m", "yt_dlp", "--version"], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let output = "";
    let error = "";

    ytDlp.stdout.on("data", (data) => {
      output += data.toString();
    });

    ytDlp.stderr.on("data", (data) => {
      error += data.toString();
    });

    ytDlp.on("close", (code) => {
      resolve({
        available: code === 0,
        version: output.trim(),
        error: error.trim(),
      });
    });

    // Timeout after 5 seconds
    setTimeout(() => {
      ytDlp.kill();
      resolve({
        available: false,
        error: "Timeout checking yt-dlp version",
      });
    }, 5000);
  });
}

async function checkNetworkConnectivity(): Promise<any> {
  try {
    // Test basic connectivity
    const response = await fetch("https://httpbin.org/ip", {
      method: "GET",
      headers: {
        "User-Agent": "VideoGrab-Diagnostic/1.0",
      },
    });

    const ipInfo = await response.json();

    // Test YouTube connectivity
    const youtubeTest = await fetch("https://www.youtube.com", {
      method: "HEAD",
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });

    return {
      serverIp: ipInfo.origin,
      youtubeAccessible: youtubeTest.ok,
      youtubeStatus: youtubeTest.status,
    };
  } catch (error) {
    return {
      error: error.message,
      youtubeAccessible: false,
    };
  }
}

async function checkCookiesFile(): Promise<any> {
  try {
    const fs = require("fs").promises;
    const path = require("path");
    
    const cookiesPath = path.join(process.cwd(), "cookies.txt");
    const stats = await fs.stat(cookiesPath);
    const content = await fs.readFile(cookiesPath, "utf8");
    
    const lines = content.split("\n").filter(line => 
      line.trim() && !line.startsWith("#")
    );

    return {
      exists: true,
      size: stats.size,
      lastModified: stats.mtime,
      cookieCount: lines.length,
      hasLoginInfo: content.includes("LOGIN_INFO"),
      hasSID: content.includes("SID"),
    };
  } catch (error) {
    return {
      exists: false,
      error: error.message,
    };
  }
}

function generateRecommendations(diagnostics: any): string[] {
  const recommendations = [];

  // Check proxy configuration
  if (!diagnostics.proxy.configured) {
    recommendations.push(
      "🚨 CRITICAL: No proxies configured. YouTube blocks DigitalOcean IPs. Set PROXY_LIST environment variable with residential proxies."
    );
  }

  // Check yt-dlp
  if (!diagnostics.ytDlp.available) {
    recommendations.push(
      "❌ yt-dlp not available. Ensure Python and yt-dlp are installed."
    );
  }

  // Check cookies
  if (!diagnostics.cookies.exists) {
    recommendations.push(
      "⚠️ cookies.txt file missing. Export fresh YouTube cookies to improve success rate."
    );
  } else if (diagnostics.cookies.cookieCount < 5) {
    recommendations.push(
      "⚠️ cookies.txt appears empty or invalid. Update with fresh YouTube cookies."
    );
  }

  // Check YouTube access
  if (!diagnostics.network.youtubeAccessible) {
    recommendations.push(
      "🚫 Cannot access YouTube directly. This confirms IP blocking - proxies are required."
    );
  }

  // Rate limiting recommendations
  if (diagnostics.rateLimit.interval < 2000) {
    recommendations.push(
      "⚡ Consider increasing MIN_REQUEST_INTERVAL to 3000ms or higher to reduce blocking."
    );
  }

  // Success case
  if (diagnostics.proxy.configured && diagnostics.ytDlp.available && diagnostics.cookies.exists) {
    recommendations.push(
      "✅ Configuration looks good. If still experiencing issues, try updating cookies or using different proxies."
    );
  }

  return recommendations;
}
