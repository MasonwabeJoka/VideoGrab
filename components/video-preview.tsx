"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Download, Play, Clock, Eye, ThumbsUp } from "lucide-react"
import Image from "next/image"
import { useState } from "react"

interface VideoInfo {
  id: string
  title: string
  thumbnail: string
  duration: string
  views: string
  likes: string
  channel: {
    name: string
    avatar: string
    subscribers: string
  }
  availableQualities: Array<{
    quality: string
    format: string
    size: string
  }>
}

interface VideoPreviewProps {
  videoInfo: VideoInfo
  selectedQuality: string
  onQualityChange: (quality: string) => void
  onDownload: () => void
}

export function VideoPreview({ videoInfo, selectedQuality, onQualityChange, onDownload }: VideoPreviewProps) {
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)

  const handleDownloadClick = () => {
    setIsDownloading(true)
    setDownloadProgress(0)

    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsDownloading(false)
          return 100
        }
        return prev + Math.random() * 15
      })
    }, 200)

    // Call the actual download function
    onDownload()

    // Reset progress after 3 seconds
    setTimeout(() => {
      setDownloadProgress(0)
      setIsDownloading(false)
    }, 3000)
  }

  return (
    <Card className="max-w-4xl mx-auto mb-12">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="w-5 h-5 text-red-500" />
          Video Preview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Video Thumbnail */}
          <div className="relative">
            <Image
              src={videoInfo.thumbnail || "/placeholder.svg?height=180&width=320"}
              alt="Video thumbnail"
              width={320}
              height={180}
              className="w-full rounded-lg"
              unoptimized
            />
            {videoInfo.duration !== "N/A" && (
              <Badge className="absolute bottom-2 right-2 bg-black/80 text-white">
                <Clock className="w-3 h-3 mr-1" />
                {videoInfo.duration}
              </Badge>
            )}
          </div>

          {/* Video Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg line-clamp-2">{videoInfo.title}</h3>
            <div className="text-sm text-gray-600">
              <p className="font-medium">{videoInfo.channel.name}</p>
              {(videoInfo.views !== "N/A" || videoInfo.likes !== "N/A") && (
                <div className="flex items-center gap-4 mt-1">
                  {videoInfo.views !== "N/A" && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      {videoInfo.views}
                    </span>
                  )}
                  {videoInfo.likes !== "N/A" && (
                    <span className="flex items-center gap-1">
                      <ThumbsUp className="w-4 h-4" />
                      {videoInfo.likes}
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Quality Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Quality:</label>
              <Select value={selectedQuality} onValueChange={onQualityChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {videoInfo.availableQualities.map((quality) => (
                    <SelectItem key={quality.quality} value={quality.quality}>
                      {quality.quality} ({quality.format.toUpperCase()}) - {quality.size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Progress Bar */}
            {isDownloading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Downloading...</span>
                  <span>{Math.round(downloadProgress)}%</span>
                </div>
                <Progress value={downloadProgress} className="w-full" />
              </div>
            )}

            {/* Download Button */}
            <Button
              onClick={handleDownloadClick}
              disabled={isDownloading}
              className="w-full bg-red-500 hover:bg-red-600"
            >
              <Download className="w-4 h-4 mr-2" />
              {isDownloading ? `Downloading ${selectedQuality}...` : `Download ${selectedQuality}`}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
