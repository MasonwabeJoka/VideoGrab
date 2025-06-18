export interface VideoInfo {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  views: string
  likes: string
  channel: {
    name: string
    avatar: string
    subscribers: string
  }
  publishedAt: string
  availableQualities: VideoQuality[]
}

export interface VideoQuality {
  quality: string
  format: string
  size: string
  url?: string
}

export interface DownloadRequest {
  url: string
  quality: string
  format: string
}

export interface DownloadResponse {
  success: boolean
  downloadUrl?: string
  error?: string
  message?: string
}
