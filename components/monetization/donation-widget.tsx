"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Heart, Coffee, Gift, DollarSign } from "lucide-react";

const donationAmounts = [
  { amount: 3, label: "☕ Coffee", description: "Buy me a coffee" },
  { amount: 5, label: "🍕 Snack", description: "Help with server costs" },
  { amount: 10, label: "🍔 Meal", description: "Support development" },
  { amount: 25, label: "🎁 Generous", description: "You're awesome!" },
];

const donationMethods = [
  {
    name: "PayPal",
    icon: "💳",
    url: "https://paypal.me/yourusername",
    description: "One-time or recurring donations",
  },
  {
    name: "Buy Me a Coffee",
    icon: "☕",
    url: "https://buymeacoffee.com/yourusername",
    description: "Simple coffee donations",
  },
  {
    name: "Ko-fi",
    icon: "🎁",
    url: "https://ko-fi.com/yourusername",
    description: "Support with tips",
  },
  {
    name: "GitHub Sponsors",
    icon: "💖",
    url: "https://github.com/sponsors/yourusername",
    description: "Monthly sponsorship",
  },
];

export function DonationWidget() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");

  const handleDonate = (method: string, amount?: number) => {
    const donationAmount = amount || selectedAmount || parseFloat(customAmount);
    console.log(`Donating $${donationAmount} via ${method}`);
    
    // Here you would redirect to the actual donation platform
    // For example, for PayPal:
    if (method === "PayPal" && donationAmount) {
      window.open(`https://paypal.me/yourusername/${donationAmount}`, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      {/* Main donation card */}
      <Card className="bg-gradient-to-br from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 border-pink-200 dark:border-pink-800">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2 text-pink-800 dark:text-pink-200">
            <Heart className="w-6 h-6" />
            Support Our Work
          </CardTitle>
          <p className="text-sm text-pink-600 dark:text-pink-300">
            Help us keep this service free and improve it for everyone!
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preset amounts */}
          <div className="grid grid-cols-2 gap-2">
            {donationAmounts.map((donation) => (
              <Button
                key={donation.amount}
                variant={selectedAmount === donation.amount ? "default" : "outline"}
                className="h-auto p-3 flex flex-col items-center"
                onClick={() => setSelectedAmount(donation.amount)}
              >
                <span className="font-semibold">${donation.amount}</span>
                <span className="text-xs">{donation.label}</span>
              </Button>
            ))}
          </div>

          {/* Custom amount */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="number"
                placeholder="Custom amount"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setSelectedAmount(null);
                }}
                className="w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
                min="1"
                step="0.01"
              />
            </div>
          </div>

          {/* Donation methods */}
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-gray-700 dark:text-gray-300">Choose donation method:</h4>
            <div className="grid grid-cols-2 gap-2">
              {donationMethods.map((method) => (
                <Button
                  key={method.name}
                  variant="outline"
                  size="sm"
                  className="h-auto p-2 flex flex-col items-center text-xs"
                  onClick={() => handleDonate(method.name)}
                  disabled={!selectedAmount && !customAmount}
                >
                  <span className="text-lg mb-1">{method.icon}</span>
                  <span>{method.name}</span>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Why donate section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Why Donate?</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <Coffee className="w-4 h-4 mt-0.5 text-brown-500" />
              <span>Keep our servers running 24/7</span>
            </li>
            <li className="flex items-start gap-2">
              <Gift className="w-4 h-4 mt-0.5 text-blue-500" />
              <span>Fund new features and improvements</span>
            </li>
            <li className="flex items-start gap-2">
              <Heart className="w-4 h-4 mt-0.5 text-red-500" />
              <span>Support open-source development</span>
            </li>
            <li className="flex items-start gap-2">
              <DollarSign className="w-4 h-4 mt-0.5 text-green-500" />
              <span>Help us keep the service free for everyone</span>
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Recent supporters (optional) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Heart className="w-5 h-5 text-red-500" />
            Recent Supporters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-sm text-gray-500">
            <p>Thank you to all our amazing supporters!</p>
            <p className="mt-2">🎉 Join our list of contributors 🎉</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
