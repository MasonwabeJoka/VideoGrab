import { VideoDownloader } from "@/components/video-downloader";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { MonetizedLayout } from "@/components/monetization/monetized-layout";

export default function Home() {
  return (
    <>
      <Header />
      <MonetizedLayout
        showHeaderAd={true}
        showSidebar={true}
        showFooterAd={true}
      >
        <VideoDownloader />
      </MonetizedLayout>
      <Footer />
    </>
  );
}
