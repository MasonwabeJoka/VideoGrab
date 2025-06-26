import { spawn } from "child_process";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export interface DownloadOptions {
  url: string;
  quality: string;
  format: string;
  onProgress?: (progress: number) => void;
}

export interface DownloadResult {
  success: boolean;
  filePath?: string;
  fileName?: string;
  error?: string;
  fileSize?: number;
}

export class YtDlpDownloader {
  private downloadsDir: string;

  constructor() {
    this.downloadsDir = path.join(process.cwd(), "downloads");
    this.ensureDownloadsDir();
  }

  private async ensureDownloadsDir() {
    try {
      await fs.access(this.downloadsDir);
    } catch {
      await fs.mkdir(this.downloadsDir, { recursive: true });
    }
  }

  async downloadVideo(options: DownloadOptions): Promise<DownloadResult> {
    const { url, quality, format, onProgress } = options;
    const downloadId = randomUUID();

    console.log("=== DOWNLOAD ATTEMPT ===");
    console.log("URL:", url);
    console.log("Quality:", quality);
    console.log("Platform:", process.platform);
    console.log("Environment:", process.env.VERCEL ? "Vercel" : process.env.RAILWAY_ENVIRONMENT ? "Railway" : "Local");
    console.log("========================");

    if (process.env.RAILWAY_ENVIRONMENT) {
      return {
        success: false,
        error: "YouTube blocks Railway's IP addresses. Please try a different hosting platform like DigitalOcean, Linode, or AWS EC2 for YouTube downloads.",
      };
    }

    const strategies = [
      {
        name: "android_client",
        args: this.buildAndroidArgs(url, downloadId, quality, format),
      },
      {
        name: "ios_client",
        args: this.buildIosArgs(url, downloadId, quality, format),
      },
      {
        name: "web_client",
        args: this.buildWebArgs(url, downloadId, quality, format),
      },
      {
        name: "basic_fallback",
        args: this.buildBasicArgs(url, downloadId, quality, format),
      },
    ];

    for (const strategy of strategies) {
      console.log(`Trying strategy: ${strategy.name}`);
      const result = await this.attemptDownload(strategy.args, downloadId, onProgress);

      if (result.success) {
        console.log(`✅ Success with strategy: ${strategy.name}`);
        return result;
      }

      console.log(`❌ Strategy ${strategy.name} failed: ${result.error}`);
    }

    return {
      success: false,
      error: "All download strategies failed. YouTube may be blocking downloads from this server.",
    };
  }

  private buildAndroidArgs(url: string, downloadId: string, quality: string, format: string): string[] {
    const outputTemplate = path.join(this.downloadsDir, `${downloadId}.%(ext)s`);
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
      "--user-agent",
      "com.google.android.youtube/17.36.4 (Linux; U; Android 12; GB) gzip",
      "--socket-timeout",
      "30",
      "--retries",
      "3",
      "--fragment-retries",
      "3",
      "--no-check-certificates",
    ];

    // Add PO Token provider URL or manual token, else fallback
    if (process.env.YOUTUBE_POT_PROVIDER_URL) {
      args.push("--extractor-args", `youtube:pot_provider_url=${process.env.YOUTUBE_POT_PROVIDER_URL}`);
    } else if (process.env.YOUTUBE_PO_TOKEN) {
      args.push("--extractor-args", `youtube:po_token=android.gvs+${process.env.YOUTUBE_PO_TOKEN}`);
    } else {
      args.push("--extractor-args", "youtube:formats=missing_pot");
    }

    return args;
  }

  private buildIosArgs(url: string, downloadId: string, quality: string, format: string): string[] {
    const outputTemplate = path.join(this.downloadsDir, `${downloadId}.%(ext)s`);

    return [
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
    ];
  }

  private buildWebArgs(url: string, downloadId: string, quality: string, format: string): string[] {
    const outputTemplate = path.join(this.downloadsDir, `${downloadId}.%(ext)s`);

    return [
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
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "--socket-timeout",
      "30",
      "--retries",
      "3",
      "--fragment-retries",
      "3",
      "--no-check-certificates",
    ];
  }

  private buildBasicArgs(url: string, downloadId: string, quality: string, format: string): string[] {
    const outputTemplate = path.join(this.downloadsDir, `${downloadId}.%(ext)s`);

    return [url, "--output", outputTemplate, "--format", "best[height<=720]/best", "--no-playlist", "--ignore-errors"];
  }

  private async attemptDownload(
    args: string[],
    downloadId: string,
    onProgress?: (progress: number) => void,
  ): Promise<DownloadResult> {
    return new Promise((resolve) => {
      console.log(`yt-dlp command: ${["python", "-m", "yt_dlp", ...args].join(" ")}`);

      const ytDlp = spawn("python", ["-m", "yt_dlp", ...args], {
        stdio: ["pipe", "pipe", "pipe"],
      });

      let outputFilePath = "";
      let fileName = "";
      let errorOutput = "";
      let lastProgress = -1;

      ytDlp.stdout.on("data", (data) => {
        const output = data.toString();
        console.log(`yt-dlp: ${output.trim()}`);

        // Parse progress
        const progressMatch = output.match(/download:(\d+(?:\.\d+)?)%/);
        if (progressMatch && onProgress) {
          const progress = Number.parseFloat(progressMatch[1]);
          const roundedProgress = Math.round(progress);
          // Throttle to every 5% progress
          if (roundedProgress !== lastProgress && roundedProgress % 5 === 0) {
            lastProgress = roundedProgress;
            console.log(`Throttled progress update: ${progress}%`);
            onProgress(progress);
          }
        }

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
      });

      ytDlp.on("close", async (code) => {
        console.log(`yt-dlp exited with code: ${code}`);

        if (code === 0) {
          if (outputFilePath) {
            try {
              const stats = await fs.stat(outputFilePath);
              // Ensure final progress update
              if (onProgress && lastProgress !== 100) {
                onProgress(100);
              }
              resolve({
                success: true,
                filePath: outputFilePath,
                fileName: fileName,
                fileSize: stats.size,
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
              // Ensure final progress update
              if (onProgress && lastProgress !== 100) {
                onProgress(100);
              }
              resolve({
                success: true,
                filePath: filePath,
                fileName: downloadedFile,
                fileSize: stats.size,
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

          if (errorOutput.includes("Sign in to confirm")) {
            errorMessage = "YouTube blocked request - server IP is blocked";
          } else if (errorOutput.includes("Video unavailable")) {
            errorMessage = "Video is unavailable";
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
      "2160p": "2160",
      "1440p": "1440",
      "1080p": "1080",
      "720p": "720",
      "480p": "480",
      "360p": "360",
    };

    const maxHeight = heightMap[quality] || "720";
    return `best[height<=${maxHeight}]/best[height<=${maxHeight}][ext=mp4]/best[ext=mp4]/best`;
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