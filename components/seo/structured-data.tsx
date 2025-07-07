"use client";

export function StructuredData() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "VideoBoom",
    "alternateName": "VideoBoom YouTube Downloader",
    "url": "https://videoboom.com",
    "description": "Free YouTube video downloader. Download YouTube videos in HD quality including MP4, MP3, 1080p, and 4K formats.",
    "potentialAction": {
      "@type": "SearchAction",
      "target": {
        "@type": "EntryPoint",
        "urlTemplate": "https://videoboom.com?url={search_term_string}"
      },
      "query-input": "required name=search_term_string"
    },
    "sameAs": [
      "https://twitter.com/videoboom",
      "https://facebook.com/videoboom"
    ]
  };

  const webApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "VideoBoom YouTube Downloader",
    "url": "https://videoboom.com",
    "description": "Free online YouTube video downloader. Download YouTube videos in high quality MP4, MP3, 1080p, 4K formats. No registration required.",
    "applicationCategory": "MultimediaApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Download YouTube videos in HD quality",
      "Support for MP4 and MP3 formats",
      "1080p and 4K video downloads",
      "No registration required",
      "Free unlimited downloads",
      "Works on all devices"
    ],
    "screenshot": "https://videoboom.com/screenshot.jpg",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "15420",
      "bestRating": "5",
      "worstRating": "1"
    }
  };

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "VideoBoom",
    "url": "https://videoboom.com",
    "logo": "https://videoboom.com/logo.png",
    "description": "Leading provider of free YouTube video downloading services.",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer service",
      "email": "support@videoboom.com"
    }
  };

  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "VideoBoom YouTube Downloader",
    "description": "Free online YouTube video downloader tool. Download videos in MP4, MP3, HD, 4K quality.",
    "url": "https://videoboom.com",
    "applicationCategory": "WebApplication",
    "operatingSystem": "Any",
    "permissions": "No special permissions required",
    "price": "0",
    "priceCurrency": "USD",
    "featureList": [
      "YouTube video downloading",
      "Multiple format support (MP4, MP3)",
      "HD and 4K quality downloads",
      "No software installation required",
      "Cross-platform compatibility"
    ]
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "Is it legal to download YouTube videos?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Downloading YouTube videos for personal use is generally acceptable, but you should respect copyright laws and YouTube's terms of service. Only download videos you have permission to download or that are in the public domain."
        }
      },
      {
        "@type": "Question",
        "name": "What video qualities are supported?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "We support all available YouTube video qualities including 144p, 240p, 360p, 480p, 720p, 1080p, 1440p, and 4K (2160p) when available from the original video."
        }
      },
      {
        "@type": "Question",
        "name": "Do I need to install any software?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No! VideoBoom is a web-based YouTube downloader that works directly in your browser. No software installation or registration required."
        }
      },
      {
        "@type": "Question",
        "name": "Is there a download limit?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, there are no download limits. You can download as many YouTube videos as you want, completely free of charge."
        }
      }
    ]
  };

  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    "name": "How to Download YouTube Videos",
    "description": "Step-by-step guide to download YouTube videos using VideoBoom",
    "image": "https://videoboom.com/how-to-download.jpg",
    "totalTime": "PT2M",
    "estimatedCost": {
      "@type": "MonetaryAmount",
      "currency": "USD",
      "value": "0"
    },
    "step": [
      {
        "@type": "HowToStep",
        "name": "Copy YouTube URL",
        "text": "Copy the URL of the YouTube video you want to download from your browser's address bar.",
        "image": "https://videoboom.com/step1.jpg"
      },
      {
        "@type": "HowToStep",
        "name": "Paste URL and Select Quality",
        "text": "Paste the URL into our downloader and choose your preferred video quality and format.",
        "image": "https://videoboom.com/step2.jpg"
      },
      {
        "@type": "HowToStep",
        "name": "Download Video",
        "text": "Click download and save the video to your device. It's that simple!",
        "image": "https://videoboom.com/step3.jpg"
      }
    ]
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Home",
        "item": "https://videoboom.com"
      },
      {
        "@type": "ListItem",
        "position": 2,
        "name": "YouTube Downloader",
        "item": "https://videoboom.com"
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(webApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(howToSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
    </>
  );
}
