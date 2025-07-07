"use client";

import { useEffect } from "react";

interface GoogleAdSenseProps {
  adSlot: string;
  adFormat?: "auto" | "rectangle" | "vertical" | "horizontal";
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
  className?: string;
}

declare global {
  interface Window {
    adsbygoogle: any[];
  }
}

export function GoogleAdSense({
  adSlot,
  adFormat = "auto",
  fullWidthResponsive = true,
  style = { display: "block" },
  className = "",
}: GoogleAdSenseProps) {
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error("AdSense error:", error);
    }
  }, []);

  return (
    <div className={`adsense-container ${className}`}>
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client={process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID}
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}

// Predefined ad components for common placements
export function HeaderAd() {
  return (
    <GoogleAdSense
      adSlot="1234567890" // Replace with your actual ad slot
      adFormat="horizontal"
      style={{ display: "block", textAlign: "center", minHeight: "90px" }}
      className="mb-4"
    />
  );
}

export function SidebarAd() {
  return (
    <GoogleAdSense
      adSlot="1234567891" // Replace with your actual ad slot
      adFormat="vertical"
      style={{ display: "block", width: "300px", height: "600px" }}
      className="sticky top-4"
    />
  );
}

export function FooterAd() {
  return (
    <GoogleAdSense
      adSlot="1234567892" // Replace with your actual ad slot
      adFormat="horizontal"
      style={{ display: "block", textAlign: "center", minHeight: "90px" }}
      className="mt-8"
    />
  );
}

export function InContentAd() {
  return (
    <GoogleAdSense
      adSlot="1234567893" // Replace with your actual ad slot
      adFormat="rectangle"
      style={{ display: "block", textAlign: "center", margin: "20px auto" }}
      className="my-6"
    />
  );
}
