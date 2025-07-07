import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { PremiumFeatures } from "@/components/monetization/premium-features";
import { DonationWidget } from "@/components/monetization/donation-widget";

export const metadata = {
  title: "Premium Features - VideoBoom",
  description: "Unlock unlimited downloads, 4K/8K quality, and ad-free experience with VideoBoom Premium",
};

export default function PremiumPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Unlock Premium Features
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Get unlimited downloads, highest quality videos, and an ad-free experience with VideoBoom Premium
              </p>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Premium Features - Takes up 2 columns */}
              <div className="lg:col-span-2">
                <PremiumFeatures />
              </div>

              {/* Sidebar with donation widget */}
              <div className="lg:col-span-1">
                <DonationWidget />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
