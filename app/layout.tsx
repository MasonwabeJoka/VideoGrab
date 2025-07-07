import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AdSenseScript } from "@/components/ads/adsense-script";
import { StructuredData } from "@/components/seo/structured-data";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL("https://videoboom.com"),
  title: {
    default:
      "VideoBoom - Free YouTube Video Downloader | Download HD Videos Online",
    template: "%s | VideoBoom - YouTube Video Downloader",
  },
  description:
    "Download YouTube videos in HD quality for free. Fast, secure, and easy-to-use online YouTube downloader. Supports MP4, MP3, 1080p, 4K downloads. No registration required.",
  keywords: [
    "youtube downloader",
    "video downloader",
    "download youtube videos",
    "youtube to mp4",
    "youtube to mp3",
    "free video downloader",
    "online video downloader",
    "HD video download",
    "4K video download",
    "1080p video download",
    "youtube converter",
    "video converter",
    "download videos online",
    "youtube video saver",
    "video download tool",
    "youtube mp4 downloader",
    "youtube mp3 converter",
    "video downloader online",
    "free youtube downloader",
    "youtube video converter",
  ],
  authors: [{ name: "VideoBoom Team", url: "https://videoboom.com" }],
  creator: "VideoBoom",
  publisher: "VideoBoom",
  applicationName: "VideoBoom",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://videoboom.com",
    siteName: "VideoBoom",
    title: "VideoBoom - Free YouTube Video Downloader | Download HD Videos",
    description:
      "Download YouTube videos in HD quality for free. Fast, secure, and easy-to-use online YouTube downloader. Supports MP4, MP3, 1080p, 4K downloads.",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "VideoBoom - YouTube Video Downloader",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@videoboom",
    creator: "@videoboom",
    title: "VideoBoom - Free YouTube Video Downloader",
    description:
      "Download YouTube videos in HD quality for free. Fast, secure, and easy-to-use online YouTube downloader.",
    images: ["/twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://videoboom.com",
    languages: {
      "en-US": "https://videoboom.com",
      en: "https://videoboom.com",
    },
  },
  category: "Technology",
  classification: "Video Downloader",
  other: {
    "msapplication-TileColor": "#da532c",
    "theme-color": "#ffffff",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID && (
          <AdSenseScript
            clientId={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}
          />
        )}
      </head>
      <body className={inter.className}>
        <StructuredData />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
