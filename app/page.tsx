import { VideoDownloader } from "@/components/video-downloader";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
// import { MonetizedLayout } from "@/components/monetization/monetized-layout";
import { HeaderAd, FooterAd } from "@/components/ads/google-adsense";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      {/* Header Ad - Google AdSense Only */}
      {process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID && (
        <div className="w-full bg-white dark:bg-gray-800 border-b">
          <div className="container mx-auto px-4 py-2">
            <HeaderAd />
          </div>
        </div>
      )}

      <main className="flex-1">
        {/* Disabled MonetizedLayout - Premium features commented out */}
        {/* <MonetizedLayout
          showHeaderAd={true}
          showSidebar={true}
          showFooterAd={true}
        >
          <VideoDownloader />
        </MonetizedLayout> */}
        <VideoDownloader />
      </main>

      {/* Footer Ad - Google AdSense Only */}
      {process.env.NEXT_PUBLIC_GOOGLE_ADSENSE_CLIENT_ID && (
        <div className="w-full bg-white dark:bg-gray-800 border-t">
          <div className="container mx-auto px-4 py-4">
            <div className="text-center text-sm text-gray-500 mb-2">
              Advertisement
            </div>
            <FooterAd />
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
