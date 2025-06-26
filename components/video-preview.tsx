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
import { Download, Play, Clock } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import Pusher from "pusher-js";
import { useToast } from "@/hooks/use-toast";

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
}: VideoPreviewProps) {
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadId, setDownloadId] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "starting" | "downloading" | "completed" | "failed">("idle");
  const { toast } = useToast();

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);
    setStatus("starting");

    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: `https://www.youtube.com/watch?v=${videoInfo.id}`,
          quality: selectedQuality,
          format: "mp4",
        }),
      });

      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to start download");
      }

      setDownloadId(data.downloadId);
      toast({ title: "Download Started", description: `Downloading in ${selectedQuality}...` });
    } catch (error) {
      setIsDownloading(false);
      setStatus("failed");
      toast({
        title: "Download Failed",
        description: error.message || "Failed to start download",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!downloadId) return;
  
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe(`download-${downloadId}`);
  
    channel.bind("progress-update", (data: { progress: number; status: string; fileName?: string; fileSize?: number; downloadUrl?: string; error?: string }) => {
      // Ensure state updates are safe
      setDownloadProgress((prev) => Math.min(data.progress, 100));
      setStatus(data.status);
      setIsDownloading(data.status === "starting" || data.status === "downloading");
  
      if (data.status === "completed" && data.downloadUrl) {
        const link = document.createElement("a");
        link.href = data.downloadUrl;
        link.download = data.fileName || `${videoInfo.title}_${selectedQuality}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({ title: "Download Complete", description: "Video downloaded successfully!" });
      } else if (data.status === "failed") {
        toast({
          title: "Download Failed",
          description: data.error || "Download failed. Please try again.",
          variant: "destructive",
        });
      }
    });
  
    return () => {
      channel.unbind_all();
      channel.unsubscribe();
      pusher.disconnect();
    };
  }, [downloadId, videoInfo.title, selectedQuality, toast]);

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
                    const label = qualityMap[quality.quality] || quality.quality;
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
                  <span>{status === "starting" ? "Starting..." : "Downloading..."}</span>
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