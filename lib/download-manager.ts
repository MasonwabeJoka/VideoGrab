export class DownloadManager {
  private static instance: DownloadManager
  private downloads = new Map<string, DownloadStatus>()

  static getInstance(): DownloadManager {
    if (!DownloadManager.instance) {
      DownloadManager.instance = new DownloadManager()
    }
    return DownloadManager.instance
  }

  addDownload(id: string, status: DownloadStatus) {
    this.downloads.set(id, status)
  }

  getDownload(id: string): DownloadStatus | undefined {
    return this.downloads.get(id)
  }

  updateProgress(id: string, progress: number) {
    const download = this.downloads.get(id)
    if (download) {
      download.progress = progress
      download.status = progress === 100 ? "completed" : "downloading"
    }
  }

  removeDownload(id: string) {
    this.downloads.delete(id)
  }

  getAllDownloads(): Map<string, DownloadStatus> {
    return new Map(this.downloads)
  }
}

export interface DownloadStatus {
  id: string
  progress: number
  status: "starting" | "downloading" | "completed" | "failed"
  fileName?: string
  fileSize?: number
  error?: string
}
