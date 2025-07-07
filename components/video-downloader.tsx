"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VideoPreview } from "./video-preview";
import { FeatureSection } from "./feature-section";
import { useToast } from "@/hooks/use-toast";

interface VideoInfo {
  id: string;
  title: string;
  thumbnail: string;
  duration: string;
  length: string;
  highestQuality: string;
  views?: string;
  likes?: string;
  channel?: {
    name: string;
    avatar: string;
    subscribers: string;
  };
  availableQualities: Array<{
    quality: string;
    format: string;
    size: string;
  }>;
}

export function VideoDownloader() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
  const [selectedQuality, setSelectedQuality] = useState("");
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    setIsLoading(true);
    setVideoInfo(null);

    try {
      const response = await fetch("/api/video-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast({
          title: "Error",
          description: data.error || "Failed to fetch video info",
          variant: "destructive",
        });
        return;
      }

      setVideoInfo(data);
      if (data.availableQualities && data.availableQualities.length > 0) {
        // Default to the highest quality (first in the list)
        setSelectedQuality(data.availableQualities[0].quality);
      }

      toast({
        title: "Success",
        description: "Video information loaded successfully!",
      });
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch video info. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent">
          Download YouTube Videos
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Fast, free, and easy way to download your favorite YouTube videos in
          high quality. No registration required.
        </p>
      </div>

      {/* Download Form */}
      <Card className="max-w-2xl mx-auto mb-12">
        <CardHeader>
          <CardTitle>Enter YouTube URL</CardTitle>
          <CardDescription>
            Paste the YouTube video URL below to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
                required
              />
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-red-500 hover:bg-red-600"
              >
                {isLoading ? "Processing..." : "Get Video"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Video Preview */}
      {videoInfo && (
        <VideoPreview
          videoInfo={videoInfo}
          selectedQuality={selectedQuality}
          onQualityChange={setSelectedQuality}
          onDownload={() => {}} // Empty, as download is handled internally in VideoPreview
        />
      )}
    </div>
  );
}
