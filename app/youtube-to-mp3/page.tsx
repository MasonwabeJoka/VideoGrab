import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { VideoDownloader } from "@/components/video-downloader";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "YouTube to MP3 Converter | Download YouTube Audio as MP3 - VideoBoom",
  description:
    "Convert YouTube videos to MP3 audio for free. High-quality YouTube to MP3 converter with 320kbps audio. Extract audio from YouTube videos instantly.",
  keywords: [
    "youtube to mp3",
    "youtube mp3 converter",
    "download youtube audio",
    "youtube audio downloader",
    "convert youtube to mp3",
    "youtube mp3 extractor",
    "free youtube to mp3",
  ],
  alternates: {
    canonical: "https://videoboom.com/youtube-to-mp3",
  },
  openGraph: {
    title: "YouTube to MP3 Converter | Download YouTube Audio as MP3",
    description:
      "Convert YouTube videos to MP3 audio for free. High-quality YouTube to MP3 converter with 320kbps audio.",
    url: "https://videoboom.com/youtube-to-mp3",
    type: "website",
  },
};

export default function YouTubeToMP3Page() {
  return (
    <>
      <Header />
      <div className="min-h-screen flex flex-col">
        <main className="flex-1">
          <div className="container mx-auto px-4 py-8">
            {/* Same UI as main page - no visible changes */}
            <VideoDownloader />

            {/* Hidden SEO content for YouTube to MP3 - not visible to users */}
            <div className="sr-only" aria-hidden="true">
              <h1>
                YouTube to MP3 Converter - Extract Audio from YouTube Videos
              </h1>
              <p>
                Convert YouTube videos to MP3 audio format for free. Our YouTube
                to MP3 converter extracts high-quality audio up to 320kbps from
                any YouTube video.
              </p>

              <h2>Why Use Our YouTube to MP3 Converter?</h2>
              <h3>High Quality Audio</h3>
              <p>
                Extract audio from YouTube videos in high quality up to 320kbps
                MP3 format.
              </p>

              <h3>Fast Audio Extraction</h3>
              <p>
                Quick YouTube to MP3 conversion with our optimized audio
                processing servers.
              </p>

              <h3>Perfect for Music</h3>
              <p>
                Ideal for downloading music, podcasts, and audio content from
                YouTube.
              </p>

              <h3>All Devices Supported</h3>
              <p>
                MP3 files work on all music players, phones, computers, and
                audio devices.
              </p>

              <h2>How to Convert YouTube to MP3</h2>
              <ol>
                <li>
                  Copy the YouTube video URL containing the audio you want
                </li>
                <li>Paste the URL into our YouTube to MP3 converter above</li>
                <li>
                  Select MP3 format and choose your preferred audio quality
                </li>
                <li>
                  Click download to save the MP3 audio file to your device
                </li>
              </ol>

              <h2>MP3 Audio Quality Options</h2>
              <ul>
                <li>320kbps MP3 - Highest Quality Audio</li>
                <li>256kbps MP3 - High Quality Audio</li>
                <li>192kbps MP3 - Good Quality Audio</li>
                <li>128kbps MP3 - Standard Quality Audio</li>
              </ul>

              <h2>Popular Uses for YouTube to MP3</h2>
              <ul>
                <li>Download music from YouTube</li>
                <li>Extract podcast audio</li>
                <li>Save educational content audio</li>
                <li>Create offline music playlists</li>
                <li>Extract audio for presentations</li>
                <li>Save meditation and relaxation audio</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
      <Footer />
    </>
  );
}
