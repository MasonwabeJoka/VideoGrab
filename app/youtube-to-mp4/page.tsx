import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { VideoDownloader } from "@/components/video-downloader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "YouTube to MP4 Converter | Download YouTube Videos as MP4 - VideoBoom",
  description:
    "Convert YouTube videos to MP4 format for free. High-quality YouTube to MP4 converter supporting 1080p, 4K downloads. Fast, secure, and easy to use.",
  keywords: [
    "youtube to mp4",
    "youtube mp4 converter",
    "download youtube as mp4",
    "youtube video to mp4",
    "convert youtube to mp4",
    "youtube mp4 downloader",
    "free youtube to mp4",
  ],
  alternates: {
    canonical: "https://videoboom.com/youtube-to-mp4",
  },
  openGraph: {
    title: "YouTube to MP4 Converter | Download YouTube Videos as MP4",
    description:
      "Convert YouTube videos to MP4 format for free. High-quality YouTube to MP4 converter supporting 1080p, 4K downloads.",
    url: "https://videoboom.com/youtube-to-mp4",
    type: "website",
  },
};

export default function YouTubeToMP4Page() {
  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            {/* Same UI as main page - no visible changes */}
            <VideoDownloader />

            {/* Hidden SEO content for YouTube to MP4 - not visible to users */}
            <div className="sr-only" aria-hidden="true">
              <h1>YouTube to MP4 Converter - Download Videos in MP4 Format</h1>
              <p>
                Convert and download YouTube videos to MP4 format for free. Our
                YouTube to MP4 converter supports high-quality downloads
                including 1080p, 1440p, and 4K resolution.
              </p>

              <h2>Why Choose Our YouTube to MP4 Converter?</h2>
              <h3>High Quality MP4 Downloads</h3>
              <p>
                Download YouTube videos in original MP4 quality up to 4K
                resolution. Preserve the video quality you love.
              </p>

              <h3>Fast Conversion</h3>
              <p>
                Our optimized servers ensure lightning-fast YouTube to MP4
                conversion and download speeds.
              </p>

              <h3>Universal Compatibility</h3>
              <p>
                MP4 format works on all devices - Windows, Mac, Android, iOS,
                and smart TVs.
              </p>

              <h3>No Software Required</h3>
              <p>
                Convert YouTube to MP4 directly in your browser. No downloads or
                installations needed.
              </p>

              <h2>How to Convert YouTube to MP4</h2>
              <ol>
                <li>Copy the YouTube video URL from your browser</li>
                <li>Paste the URL into our YouTube to MP4 converter above</li>
                <li>
                  Select MP4 format and your preferred quality (1080p, 4K, etc.)
                </li>
                <li>Click download to save the MP4 video to your device</li>
              </ol>

              <h2>Supported MP4 Quality Options</h2>
              <ul>
                <li>4K MP4 (2160p) - Ultra High Definition</li>
                <li>1440p MP4 - Quad HD Quality</li>
                <li>1080p MP4 - Full HD Quality</li>
                <li>720p MP4 - HD Quality</li>
                <li>480p MP4 - Standard Definition</li>
                <li>360p MP4 - Mobile Friendly</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
