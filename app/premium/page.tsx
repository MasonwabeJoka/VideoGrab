import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
// import { PremiumFeatures } from "@/components/monetization/premium-features";
// import { DonationWidget } from "@/components/monetization/donation-widget";

export const metadata = {
  title: "Premium Features - VideoBoom",
  description:
    "Premium features are currently disabled. Only Google AdSense monetization is active.",
};

export default function PremiumPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Premium Features Disabled */}
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-gray-200">
                Premium Features
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                Premium features are currently disabled. We're focusing on
                providing the best free experience with Google AdSense support.
              </p>
            </div>

            <div className="max-w-4xl mx-auto text-center">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-lg">
                <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
                <p className="text-gray-600 dark:text-gray-300">
                  Premium features and donation options will be available in a
                  future update. For now, enjoy unlimited high-quality downloads
                  with our ad-supported model.
                </p>
              </div>
            </div>

            {/* Premium Features and Donation Components - Commented Out */}
            {/* <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <PremiumFeatures />
              </div>
              <div className="lg:col-span-1">
                <DonationWidget />
              </div>
            </div> */}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
