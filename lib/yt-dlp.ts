import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export interface DownloadOptions {
  url: string;
  quality: string;
  format: string;
  title?: string;
}

export interface DownloadResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
  fileSize?: number;
  actualQuality?: string;
  fallback?: boolean;
  attemptedQualities?: string[];
  videoOnly?: boolean;
}

export class YtDlpDownloader {
  private downloadsDir: string;
  private proxyList: string[];
  private currentProxyIndex: number;
  private lastRequestTime: number;
  private minRequestInterval: number; // Rate limiting in milliseconds
  private activeDownloads: number;
  private maxConcurrentDownloads: number;

  constructor() {
    this.downloadsDir = path.join(process.cwd(), "downloads");
    this.ensureDownloadsDir();

    // Initialize proxy rotation and rate limiting
    this.proxyList = this.getProxyList();
    this.currentProxyIndex = 0;
    this.lastRequestTime = 0;
    this.minRequestInterval = parseInt(process.env.MIN_REQUEST_INTERVAL || "2000");
    this.activeDownloads = 0;
    this.maxConcurrentDownloads = parseInt(process.env.MAX_CONCURRENT_DOWNLOADS || "3");
  }

  private async ensureDownloadsDir() {
    try {
      await fs.access(this.downloadsDir);
    } catch {
      await fs.mkdir(this.downloadsDir, { recursive: true });
    }
  }

  private getProxyList(): string[] {
    // Environment variable for proxy configuration
    const proxyEnv = process.env.PROXY_LIST;
    if (proxyEnv) {
      return proxyEnv.split(',').map(proxy => proxy.trim());
    }

    // Default empty list - no proxies configured
    return [];
  }

  private getNextProxy(): string | null {
    if (this.proxyList.length === 0) {
      return null;
    }

    const proxy = this.proxyList[this.currentProxyIndex];
    this.currentProxyIndex = (this.currentProxyIndex + 1) % this.proxyList.length;
    return proxy;
  }

  private async enforceRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;

    if (timeSinceLastRequest < this.minRequestInterval) {
      const waitTime = this.minRequestInterval - timeSinceLastRequest;
      console.log(`Rate limiting: waiting ${waitTime}ms before next request`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    this.lastRequestTime = Date.now();
  }

  private getRandomUserAgent(): string {
    const userAgents = [
      // Chrome on Windows
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      // Firefox on Windows
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:120.0) Gecko/20100101 Firefox/120.0",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:119.0) Gecko/20100101 Firefox/119.0",
      // Chrome on macOS
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36",
      // Safari on macOS
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
      // Chrome on Linux
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    ];

    return userAgents[Math.floor(Math.random() * userAgents.length)];
  }

  public getProxyStatus(): { total: number; current: number; configured: boolean } {
    return {
      total: this.proxyList.length,
      current: this.currentProxyIndex,
      configured: this.proxyList.length > 0,
    };
  }

  public getActiveDownloads(): number {
    return this.activeDownloads;
  }

  async downloadVideo(options: DownloadOptions): Promise<DownloadResult> {
    let { url, quality, format, title } = options;
    const downloadId = randomUUID();
    let triedFallback = false;
    let fallbackNotified = false;
    let attemptedQualities = [quality];

    // Check concurrent download limit
    if (this.activeDownloads >= this.maxConcurrentDownloads) {
      return {
        success: false,
        error: `Maximum concurrent downloads (${this.maxConcurrentDownloads}) reached. Please try again later.`,
        fallback: false,
        attemptedQualities: [quality],
      };
    }

    // Enforce rate limiting before starting download
    await this.enforceRateLimit();

    // Increment active downloads counter
    this.activeDownloads++;

    // Start with the requested quality, but ensure we have the full quality list
    const qualities = [
      "4320p", "2160p", "1440p", "1080p", "720p", "480p", "360p"
    ];

    // If the requested quality is not in our list, start from the highest
    let qualityIndex = qualities.indexOf(quality);
    if (qualityIndex === -1) {
      // If quality not found, try to find the closest match or start from highest
      const requestedHeight = parseInt(quality.replace('p', ''));
      qualityIndex = qualities.findIndex(q => parseInt(q.replace('p', '')) <= requestedHeight);
      if (qualityIndex === -1) qualityIndex = 0; // Start from highest if no match
    }

    let lastError = null;

    // Try the requested quality first with all strategies
    console.log(`Starting download attempt for quality: ${quality}`);
    console.log(`Proxy status: ${this.proxyList.length > 0 ? `${this.proxyList.length} proxies configured` : 'No proxies configured'}`);

    const strategies = [
      {
        name: "android_client_with_proxy",
        args: this.buildAndroidArgs(url, downloadId, quality, format, title),
      },
      {
        name: "ios_client_with_proxy",
        args: this.buildIosArgs(url, downloadId, quality, format, title),
      },
      {
        name: "web_client_with_proxy",
        args: this.buildWebArgs(url, downloadId, quality, format, title),
      },
      {
        name: "basic_no_cookies",
        args: this.buildBasicArgsNoCookies(url, downloadId, quality, format, title),
      },
      {
        name: "getpot_high_quality",
        args: this.buildGetPOTArgs(url, downloadId, quality, format, title),
      },
      {
        name: "basic_fallback",
        args: this.buildBasicArgs(url, downloadId, quality, format, title),
      },
    ];

    for (const strategy of strategies) {
      console.log(`Trying strategy: ${strategy.name} for quality: ${quality}`);
      const result = await this.attemptDownload(strategy.args, downloadId);
      if (result.success) {
        console.log(`✅ Success with strategy: ${strategy.name} at quality: ${quality}`);
        return { ...result, actualQuality: quality, fallback: false };
      }
      lastError = result.error;
      console.log(`❌ Strategy ${strategy.name} failed: ${result.error}`);
    }

    // If the requested quality failed, try fallback qualities
    console.log(`All strategies failed for ${quality}, trying fallback qualities...`);
    triedFallback = true;

    while (qualityIndex < qualities.length) {
      const currentQuality = qualities[qualityIndex];
      if (currentQuality === quality) {
        qualityIndex++;
        continue; // Skip the quality we already tried
      }

      attemptedQualities.push(currentQuality);
      console.log(`Trying fallback quality: ${currentQuality}`);

      for (const strategy of strategies) {
        console.log(`Trying strategy: ${strategy.name} for quality: ${currentQuality}`);
        const fallbackArgs = this.buildStrategyArgs(strategy.name, url, downloadId, currentQuality, format, title);
        const result = await this.attemptDownload(fallbackArgs, downloadId);
        if (result.success) {
          console.log(`✅ Success with strategy: ${strategy.name} at quality: ${currentQuality}`);
          this.activeDownloads--; // Decrement counter on success
          return { ...result, actualQuality: currentQuality, fallback: triedFallback };
        }
        lastError = result.error;
        console.log(`❌ Strategy ${strategy.name} failed: ${result.error}`);
      }
      // If we failed and this was the first fallback, notify the frontend
      if (!triedFallback && qualityIndex === 0) {
        triedFallback = true;
        fallbackNotified = true;
        qualityIndex++;
        return {
          success: false,
          error: `The selected quality (${quality}) is not available. Trying the next lower quality...`,
          fallback: true,
          attemptedQualities,
        };
      }
      // Otherwise, just try the next lower quality without notifying again
      qualityIndex++;
    }
    // Decrement counter on failure
    this.activeDownloads--;

    return {
      success: false,
      error: lastError || "All download strategies failed. YouTube may be blocking downloads from this server. Consider using proxies or updating cookies.",
      fallback: triedFallback,
      attemptedQualities,
    };
  }

  private buildStrategyArgs(strategyName: string, url: string, downloadId: string, quality: string, format: string, title?: string): string[] {
    switch (strategyName) {
      case "getpot_high_quality":
        return this.buildGetPOTArgs(url, downloadId, quality, format, title);
      case "android_client":
        return this.buildAndroidArgs(url, downloadId, quality, format, title);
      case "ios_client":
        return this.buildIosArgs(url, downloadId, quality, format, title);
      case "web_client":
        return this.buildWebArgs(url, downloadId, quality, format, title);
      case "basic_fallback":
        return this.buildBasicArgs(url, downloadId, quality, format, title);
      default:
        return this.buildBasicArgs(url, downloadId, quality, format, title);
    }
  }

  private sanitizeTitle(title?: string): string {
    if (!title) return "video";
    // Remove characters not allowed in filenames
    return title.replace(/[^a-zA-Z0-9-_\. ]/g, "_");
  }

  private buildGetPOTArgs(url: string, downloadId: string, quality: string, format: string, title?: string): string[] {
    const outputTemplate = path.join(this.downloadsDir, `${this.sanitizeTitle(title) || downloadId}.%(ext)s`);
    const args = [
      url,
      "--output",
      outputTemplate,
      "--format",
      this.getFormatSelector(quality, format),
      "--no-playlist",
      "--write-info-json",
      "--progress-template",
      "download:%(progress._percent_str)s",
      "--extractor-args",
      "youtube:player_client=android",
      "--extractor-args",
      "youtube:formats=missing_pot",
      "--user-agent",
      "com.google.android.youtube/17.36.4 (Linux; U; Android 12; GB) gzip",
      "--socket-timeout",
      "30",
      "--retries",
      "3",
      "--fragment-retries",
      "3",
      "--no-check-certificates",
      "--cookies",
      path.join(process.cwd(), "cookies.txt"),
      // Additional args for better quality
      "--merge-output-format",
      "mp4",
      "--prefer-free-formats",
    ];

    // Add proxy if available
    const proxy = this.getNextProxy();
    if (proxy) {
      args.push("--proxy", proxy);
      console.log(`Using proxy: ${proxy}`);
    }

    return args;
  }

  private buildAndroidArgs(url: string, downloadId: string, quality: string, format: string, title?: string): string[] {
    const outputTemplate = path.join(this.downloadsDir, `${this.sanitizeTitle(title) || downloadId}.%(ext)s`);
    const args = [
      url,
      "--output",
      outputTemplate,
      "--format",
      this.getFormatSelector(quality, format),
      "--no-playlist",
      "--write-info-json",
      "--progress-template",
      "download:%(progress._percent_str)s",
      "--extractor-args",
      "youtube:player_client=android",
      "--extractor-args",
      "youtube:formats=missing_pot",
      "--user-agent",
      "com.google.android.youtube/17.36.4 (Linux; U; Android 12; GB) gzip",
      "--socket-timeout",
      "30",
      "--retries",
      "3",
      "--fragment-retries",
      "3",
      "--no-check-certificates",
      "--cookies",
      path.join(process.cwd(), "cookies.txt"),
      "--merge-output-format",
      "mp4",
    ];

    // Add proxy if available
    const proxy = this.getNextProxy();
    if (proxy) {
      args.push("--proxy", proxy);
      console.log(`Using proxy: ${proxy}`);
    }

    return args;
  }

  private buildIosArgs(url: string, downloadId: string, quality: string, format: string, title?: string): string[] {
    const outputTemplate = path.join(this.downloadsDir, `${this.sanitizeTitle(title) || downloadId}.%(ext)s`);
    const args = [
      url,
      "--output",
      outputTemplate,
      "--format",
      this.getFormatSelector(quality, format),
      "--no-playlist",
      "--write-info-json",
      "--progress-template",
      "download:%(progress._percent_str)s",
      "--extractor-args",
      "youtube:player_client=ios",
      "--user-agent",
      "com.google.ios.youtube/17.36.4 (iPhone14,3; U; CPU iOS 15_6 like Mac OS X)",
      "--socket-timeout",
      "30",
      "--retries",
      "3",
      "--fragment-retries",
      "3",
      "--no-check-certificates",
      "--cookies",
      path.join(process.cwd(), "cookies.txt"),
      "--merge-output-format",
      "mp4",
    ];

    // Add proxy if available
    const proxy = this.getNextProxy();
    if (proxy) {
      args.push("--proxy", proxy);
      console.log(`Using proxy: ${proxy}`);
    }

    return args;
  }

  private buildBasicArgs(url: string, downloadId: string, quality: string, format: string, title?: string): string[] {
    const outputTemplate = path.join(this.downloadsDir, `${this.sanitizeTitle(title) || downloadId}.%(ext)s`);
    const args = [
      url,
      "--output",
      outputTemplate,
      "--format",
      this.getFormatSelector(quality, format),
      "--no-playlist",
      "--write-info-json",
      "--progress-template",
      "download:%(progress._percent_str)s",
      "--user-agent",
      this.getRandomUserAgent(),
      "--socket-timeout",
      "30",
      "--retries",
      "3",
      "--fragment-retries",
      "3",
      "--no-check-certificates",
      "--cookies",
      path.join(process.cwd(), "cookies.txt"),
      "--merge-output-format",
      "mp4",
    ];

    // Add proxy if available
    const proxy = this.getNextProxy();
    if (proxy) {
      args.push("--proxy", proxy);
      console.log(`Using proxy: ${proxy}`);
    }

    return args;
  }

  private buildWebArgs(url: string, downloadId: string, quality: string, format: string, title?: string): string[] {
    const outputTemplate = path.join(this.downloadsDir, `${this.sanitizeTitle(title) || downloadId}.%(ext)s`);
    const args = [
      url,
      "--output",
      outputTemplate,
      "--format",
      this.getFormatSelector(quality, format),
      "--no-playlist",
      "--write-info-json",
      "--progress-template",
      "download:%(progress._percent_str)s",
      "--user-agent",
      this.getRandomUserAgent(),
      "--socket-timeout",
      "30",
      "--retries",
      "3",
      "--fragment-retries",
      "3",
      "--no-check-certificates",
      "--cookies",
      path.join(process.cwd(), "cookies.txt"),
      "--merge-output-format",
      "mp4",
    ];

    // Add proxy if available
    const proxy = this.getNextProxy();
    if (proxy) {
      args.push("--proxy", proxy);
      console.log(`Using proxy: ${proxy}`);
    }

    return args;
  }

  private buildBasicArgsNoCookies(url: string, downloadId: string, quality: string, format: string, title?: string): string[] {
    const outputTemplate = path.join(this.downloadsDir, `${this.sanitizeTitle(title) || downloadId}.%(ext)s`);
    const args = [
      url,
      "--output",
      outputTemplate,
      "--format",
      this.getFormatSelector(quality, format),
      "--no-playlist",
      "--write-info-json",
      "--progress-template",
      "download:%(progress._percent_str)s",
      "--user-agent",
      this.getRandomUserAgent(),
      "--socket-timeout",
      "30",
      "--retries",
      "5", // More retries for no-cookies approach
      "--fragment-retries",
      "5",
      "--no-check-certificates",
      "--merge-output-format",
      "mp4",
      // Additional args to avoid detection
      "--sleep-interval",
      "1",
      "--max-sleep-interval",
      "3",
    ];

    // Add proxy if available (critical for no-cookies approach)
    const proxy = this.getNextProxy();
    if (proxy) {
      args.push("--proxy", proxy);
      console.log(`Using proxy (no-cookies): ${proxy}`);
    } else {
      console.warn("⚠️  No proxy configured - this may fail on cloud servers");
    }

    return args;
  }

  private async attemptDownload(
    args: string[],
    downloadId: string,
  ): Promise<DownloadResult> {
    return new Promise((resolve) => {
      console.log(`yt-dlp command: ${["python", "-m", "yt_dlp", ...args].join(" ")}`);
      const ytDlp = spawn("python", ["-m", "yt_dlp", ...args], {
        stdio: ["pipe", "pipe", "pipe"],
      });
      let outputFilePath = "";
      let fileName = "";
      let errorOutput = "";
      ytDlp.stdout.on("data", (data) => {
        const output = data.toString();
        console.log(`yt-dlp: ${output.trim()}`);
        // Extract output file path
        const fileMatch =
          output.match(/\[download\] Destination: (.+)/) ||
          output.match(/\[download\] (.+) has already been downloaded/);
        if (fileMatch) {
          outputFilePath = fileMatch[1];
          fileName = path.basename(outputFilePath);
        }
        const mergeMatch = output.match(/\[Merger\] Merging formats into "(.+)"/);
        if (mergeMatch) {
          outputFilePath = mergeMatch[1];
          fileName = path.basename(outputFilePath);
        }
      });
      ytDlp.stderr.on("data", (data) => {
        const error = data.toString();
        errorOutput += error;
        console.error(`yt-dlp error: ${error.trim()}`);

        // Enhanced error detection for YouTube blocking
        if (error.includes("HTTP Error 403") ||
            error.includes("HTTP Error 429") ||
            error.includes("blocked") ||
            error.includes("Sign in to confirm") ||
            error.includes("This video is not available") ||
            error.includes("Private video") ||
            error.includes("Video unavailable") ||
            error.includes("Requested format is not available")) {
          console.error("🚫 YouTube blocking detected!");
        }
      });
      ytDlp.on("close", async (code) => {
        console.log(`yt-dlp exited with code: ${code}`);
        if (code === 0) {
          if (outputFilePath) {
            try {
              const stats = await fs.stat(outputFilePath);
              const videoOnly = !outputFilePath.endsWith(".m4a") && !outputFilePath.endsWith(".mp4");
              resolve({
                success: true,
                filePath: outputFilePath,
                fileName: fileName,
                fileSize: stats.size,
                videoOnly,
              });
              return;
            } catch (error) {
              console.error(`File not found: ${outputFilePath}`);
            }
          }
          try {
            const files = await fs.readdir(this.downloadsDir);
            const downloadedFile = files.find((file) => file.startsWith(downloadId) && !file.endsWith(".info.json"));
            if (downloadedFile) {
              const filePath = path.join(this.downloadsDir, downloadedFile);
              const stats = await fs.stat(filePath);
              const videoOnly = !filePath.endsWith(".m4a") && !filePath.endsWith(".mp4");
              resolve({
                success: true,
                filePath: filePath,
                fileName: downloadedFile,
                fileSize: stats.size,
                videoOnly,
              });
              return;
            }
          } catch (error) {
            console.error(`Error searching files: ${error}`);
          }
          resolve({
            success: false,
            error: "Download completed but file not found",
          });
        } else {
          let errorMessage = `Download failed (code ${code})`;

          // Enhanced error detection and messaging
          if (errorOutput.includes("Sign in to confirm") ||
              errorOutput.includes("HTTP Error 403") ||
              errorOutput.includes("HTTP Error 429") ||
              errorOutput.includes("blocked")) {
            const proxyStatus = this.getProxyStatus();
            if (!proxyStatus.configured) {
              errorMessage = "YouTube blocked request: server IP is blocked. Configure PROXY_LIST environment variable with residential proxies to resolve this issue.";
            } else {
              errorMessage = "YouTube blocked request despite proxy usage. Try updating cookies.txt or using different proxy servers.";
            }
          } else if (errorOutput.includes("Video unavailable")) {
            errorMessage = "Video is unavailable or private";
          } else if (errorOutput.includes("Requested format is not available")) {
            errorMessage = "Requested video quality is not available";
          }
          resolve({
            success: false,
            error: errorMessage,
          });
        }
      });
      ytDlp.on("error", (error) => {
        resolve({
          success: false,
          error: `Failed to start yt-dlp: ${error.message}`,
        });
      });
    });
  }

  private getFormatSelector(quality: string, format: string): string {
    if (format === "mp3") {
      return "bestaudio[ext=m4a]/bestaudio/best";
    }
    const heightMap: Record<string, string> = {
      "8K": "4320",
      "4320p": "4320",
      "4K": "2160",
      "2160p": "2160",
      "1440p": "1440",
      "1080p": "1080",
      "720p": "720",
      "480p": "480",
      "360p": "360",
    };
    const maxHeight = heightMap[quality] || "2160";

    // Enhanced format selection for highest quality
    // Use exact height match first, then fallback to <= constraint
    const formatSelectors = [
      // Try exact height match with best video+audio combination
      `bestvideo[height=${maxHeight}][ext=mp4]+bestaudio[ext=m4a]`,
      // Try exact height match with any codec
      `bestvideo[height=${maxHeight}]+bestaudio`,
      // Try height constraint with preferred codec
      `bestvideo[height<=${maxHeight}][ext=mp4][vcodec^=avc1]+bestaudio[ext=m4a]`,
      // Try height constraint with any video codec
      `bestvideo[height<=${maxHeight}][ext=mp4]+bestaudio[ext=m4a]`,
      // Try height constraint with any format
      `bestvideo[height<=${maxHeight}]+bestaudio`,
      // Single file formats with exact height
      `best[height=${maxHeight}][ext=mp4]`,
      // Single file formats with height constraint
      `best[height<=${maxHeight}][ext=mp4]`,
      // Any format with height constraint
      `best[height<=${maxHeight}]`,
      // Final fallback to best available
      `best`
    ];

    return formatSelectors.join('/');
  }

  async cleanupOldFiles(maxAgeHours = 24) {
    try {
      const files = await fs.readdir(this.downloadsDir);
      const now = Date.now();
      const maxAge = maxAgeHours * 60 * 60 * 1000;
      for (const file of files) {
        const filePath = path.join(this.downloadsDir, file);
        const stats = await fs.stat(filePath);
        if (now - stats.mtime.getTime() > maxAge) {
          await fs.unlink(filePath);
          console.log(`Cleaned up old file: ${file}`);
        }
      }
    } catch (error) {
      console.error("Error cleaning up files:", error);
    }
  }
}

export const ytDlpDownloader = new YtDlpDownloader(); 
