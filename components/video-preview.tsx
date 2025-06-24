"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Download, Play, Clock, Eye, ThumbsUp } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  length: string;
  highestQuality: string;
  availableQualities: Array<{
    quality: string;
    format: string;
    size: string;
  }>;
}

interface VideoPreviewProps {
  videoInfo: VideoInfo;
  selectedQuality: string;
  onQualityChange: (quality: string) => void;
  onDownload: () => void;
}

export function VideoPreview({
  videoInfo,
  selectedQuality,
  onQualityChange,
  onDownload,
}: VideoPreviewProps) {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadClick = () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          return 100;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    // Call the actual download function
    onDownload();

    // Reset progress after 3 seconds
    setTimeout(() => {
      setDownloadProgress(0);
      setIsDownloading(false);
    }, 3000);
  };

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
              src={
                videoInfo.thumbnail || "/placeholder.svg?height=180&width=320"
              }
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
            <h3 className="font-semibold text-lg line-clamp-2">
              {videoInfo.title}
            </h3>
            <div className="text-sm text-gray-600">
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {videoInfo.length}
                </span>
                <span className="flex items-center gap-1">
                  <Badge variant="outline">{videoInfo.highestQuality}</Badge>
                </span>
              </div>
            </div>

            {/* Quality Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Quality:</label>
              <Select value={selectedQuality} onValueChange={onQualityChange}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {videoInfo.availableQualities.map((quality) => {
                    const qualityMap: Record<string, string> = {
                      "1440p": "2k",
                      "2048p": "2k",
                      "2160p": "4k",
                      "3840p": "4k",
                      "4096p": "4k",
                      "4320p": "8k",
                      "7680p": "8k",
                    };
                    const label =
                      qualityMap[quality.quality] || quality.quality;
                    return (
                      <SelectItem key={quality.quality} value={quality.quality}>
                        {label} ({quality.format.toUpperCase()})
                      </SelectItem>
                    );
                  })}
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
              {isDownloading
                ? `Downloading ${selectedQuality}...`
                : `Download ${selectedQuality}`}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
