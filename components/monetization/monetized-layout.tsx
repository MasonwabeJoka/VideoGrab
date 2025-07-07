"use client";

import { ReactNode } from "react";
import { HeaderAd, SidebarAd, FooterAd, InContentAd } from "../ads/google-adsense";
import { Card, CardContent } from "../ui/card";

interface MonetizedLayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
  showHeaderAd?: boolean;
  showFooterAd?: boolean;
  showInContentAd?: boolean;
}

export function MonetizedLayout({
  children,
  showSidebar = true,
  showHeaderAd = true,
  showFooterAd = true,
  showInContentAd = false,
}: MonetizedLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header Ad */}
      {showHeaderAd && (
        <div className="w-full bg-white dark:bg-gray-800 border-b">
          <div className="container mx-auto px-4 py-2">
            <HeaderAd />
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className={`grid gap-8 ${showSidebar ? "lg:grid-cols-4" : "lg:grid-cols-1"}`}>
          {/* Main Content */}
          <div className={showSidebar ? "lg:col-span-3" : "lg:col-span-1"}>
            {children}
            
            {/* In-Content Ad */}
            {showInContentAd && (
              <Card className="my-8">
                <CardContent className="p-4">
                  <div className="text-center text-sm text-gray-500 mb-2">Advertisement</div>
                  <InContentAd />
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar with Ads */}
          {showSidebar && (
            <div className="lg:col-span-1">
              <div className="space-y-6">
                {/* Sidebar Ad */}
                <Card>
                  <CardContent className="p-4">
                    <div className="text-center text-sm text-gray-500 mb-2">Advertisement</div>
                    <SidebarAd />
                  </CardContent>
                </Card>

                {/* Additional monetization content */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">💎 Premium Features</h3>
                    <ul className="text-sm space-y-1 text-gray-600 dark:text-gray-300">
                      <li>• Unlimited downloads</li>
                      <li>• 4K/8K quality support</li>
                      <li>• Batch downloads</li>
                      <li>• No ads</li>
                      <li>• Priority support</li>
                    </ul>
                    <button className="w-full mt-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2 px-4 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-700 transition-all">
                      Upgrade to Premium
                    </button>
                  </CardContent>
                </Card>

                {/* Donation/Support */}
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-semibold mb-2">☕ Support Us</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                      Help keep this service free and running!
                    </p>
                    <button className="w-full bg-yellow-500 text-white py-2 px-4 rounded-lg text-sm font-medium hover:bg-yellow-600 transition-colors">
                      Buy Me a Coffee
                    </button>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Ad */}
      {showFooterAd && (
        <div className="w-full bg-white dark:bg-gray-800 border-t mt-8">
          <div className="container mx-auto px-4 py-4">
            <div className="text-center text-sm text-gray-500 mb-2">Advertisement</div>
            <FooterAd />
          </div>
        </div>
      )}
    </div>
  );
}
