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
import { useState, useEffect, useRef } from "react";
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
  const [status, setStatus] = useState<
    "idle" | "processing" | "completed" | "failed"
  >("idle");
  const [fallbackError, setFallbackError] = useState<string | null>(null);
  const { toast } = useToast();
  const pollTimeout = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!downloadId || !isDownloading) return;
    let cancelled = false;
    const poll = async () => {
      const res = await fetch(`/api/download?id=${downloadId}`);
      const statusData = await res.json();
      if (
        statusData.error &&
        statusData.error.includes("Trying the next lower quality")
      ) {
        setFallbackError(statusData.error);
      }
      if (statusData.status === "completed") {
        setStatus("completed");
        setIsDownloading(false);
        setFallbackError(null);
        if (
          statusData.actualQuality &&
          statusData.actualQuality !== selectedQuality
        ) {
          toast({
            title: "Downloaded at lower quality",
            description: `The video was downloaded at ${statusData.actualQuality} because the selected quality was not available.`,
          });
        }
        if (statusData.videoOnly) {
          toast({
            title: "Video-Only Download",
            description:
              "The highest quality available is video-only (no audio).",
            variant: "destructive",
          });
        }
        // Trigger download
        const link = document.createElement("a");
        link.href = `/api/download/file?id=${downloadId}&file=${encodeURIComponent(
          statusData.fileName ||
            videoInfo.title + "_" + selectedQuality + ".mp4"
        )}`;
        link.download =
          statusData.fileName || `${videoInfo.title}_${selectedQuality}.mp4`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({
          title: "Download Complete",
          description: "Video downloaded successfully!",
        });
      } else if (statusData.status === "failed") {
        if (
          !statusData.error ||
          !statusData.error.includes("Trying the next lower quality")
        ) {
          setFallbackError(null);
          setStatus("failed");
          setIsDownloading(false);
          toast({
            title: "Download Failed",
            description:
              statusData.error || "Download failed. Please try again.",
            variant: "destructive",
          });
        }
      } else if (!cancelled) {
        pollTimeout.current = setTimeout(poll, 2000);
      }
    };
    poll();
    return () => {
      cancelled = true;
      if (pollTimeout.current) clearTimeout(pollTimeout.current);
    };
  }, [downloadId, isDownloading, selectedQuality, toast, videoInfo.title]);

  const handleDownloadClick = async () => {
    setIsDownloading(true);
    setStatus("processing");
    setFallbackError(null);
    try {
      const response = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: `https://www.youtube.com/watch?v=${videoInfo.id}`,
          quality: selectedQuality,
          format: "mp4",
          title: videoInfo.title,
        }),
      });
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.error || "Failed to start download");
      }
      setDownloadId(data.downloadId);
      toast({
        title: "Video Processing",
        description: `Processing in ${selectedQuality}...`,
      });
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
                <div className="flex items-center gap-2 text-sm">
                  <span>
                    {status === "processing" ? (
                      <>
                        Video Processing...{"  "}
                        <span className="w-4 h-4 border-[8px] border-white border-b-[#FF3D00] rounded-full inline-block box-border animate-spin" />
                      </>
                    ) : status === "completed" ? (
                      "Done!"
                    ) : status === "failed" ? (
                      "Failed"
                    ) : (
                      ""
                    )}
                  </span>
                </div>
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

            {/* Show fallback error above status text */}
            {fallbackError && (
              <div className="text-yellow-600 text-sm font-medium mb-2">
                {fallbackError}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
