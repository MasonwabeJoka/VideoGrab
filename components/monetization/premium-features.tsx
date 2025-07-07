"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Check, Crown, Zap, Download, Shield, Headphones } from "lucide-react";

interface PremiumFeature {
  icon: React.ReactNode;
  title: string;
  description: string;
  freeLimit?: string;
  premiumLimit?: string;
}

const premiumFeatures: PremiumFeature[] = [
  {
    icon: <Download className="w-5 h-5" />,
    title: "Unlimited Downloads",
    description: "Download as many videos as you want",
    freeLimit: "5 per day",
    premiumLimit: "Unlimited",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "4K/8K Quality",
    description: "Access to highest quality formats",
    freeLimit: "Up to 1080p",
    premiumLimit: "Up to 8K",
  },
  {
    icon: <Shield className="w-5 h-5" />,
    title: "Ad-Free Experience",
    description: "No advertisements while using the service",
    freeLimit: "With ads",
    premiumLimit: "Ad-free",
  },
  {
    icon: <Download className="w-5 h-5" />,
    title: "Batch Downloads",
    description: "Download multiple videos at once",
    freeLimit: "One at a time",
    premiumLimit: "Batch download",
  },
  {
    icon: <Zap className="w-5 h-5" />,
    title: "Faster Downloads",
    description: "Priority servers for faster download speeds",
    freeLimit: "Standard speed",
    premiumLimit: "2x faster",
  },
  {
    icon: <Headphones className="w-5 h-5" />,
    title: "Priority Support",
    description: "Get help faster with premium support",
    freeLimit: "Community support",
    premiumLimit: "24/7 priority support",
  },
];

const pricingPlans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: ["5 downloads per day", "Up to 1080p quality", "Standard speed", "Community support"],
    buttonText: "Current Plan",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    name: "Premium",
    price: "$4.99",
    period: "month",
    features: ["Unlimited downloads", "Up to 8K quality", "Ad-free experience", "Batch downloads", "2x faster speed", "Priority support"],
    buttonText: "Upgrade Now",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    name: "Lifetime",
    price: "$29.99",
    period: "one-time",
    features: ["All Premium features", "Lifetime access", "Future updates included", "VIP support"],
    buttonText: "Best Value",
    buttonVariant: "default" as const,
    popular: false,
  },
];

export function PremiumFeatures() {
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleUpgrade = (planName: string) => {
    setSelectedPlan(planName);
    // Here you would integrate with your payment processor (Stripe, PayPal, etc.)
    console.log(`Upgrading to ${planName} plan`);
  };

  return (
    <div className="space-y-8">
      {/* Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-yellow-500" />
            Premium Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            {premiumFeatures.map((feature, index) => (
              <div key={index} className="flex items-start gap-4 p-4 rounded-lg border">
                <div className="text-blue-500">{feature.icon}</div>
                <div className="flex-1">
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {feature.description}
                  </p>
                  {feature.freeLimit && feature.premiumLimit && (
                    <div className="flex gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Free: </span>
                        <span>{feature.freeLimit}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Premium: </span>
                        <span className="text-green-600 font-medium">{feature.premiumLimit}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid md:grid-cols-3 gap-6">
        {pricingPlans.map((plan, index) => (
          <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-lg' : ''}`}>
            {plan.popular && (
              <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-blue-500">
                Most Popular
              </Badge>
            )}
            <CardHeader className="text-center">
              <CardTitle className="text-xl">{plan.name}</CardTitle>
              <div className="text-3xl font-bold">
                {plan.price}
                <span className="text-sm font-normal text-gray-500">/{plan.period}</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-2">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.buttonVariant}
                className="w-full"
                onClick={() => handleUpgrade(plan.name)}
                disabled={plan.name === "Free"}
              >
                {plan.buttonText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Money-back guarantee */}
      <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
        <CardContent className="p-6 text-center">
          <Shield className="w-8 h-8 text-green-500 mx-auto mb-2" />
          <h3 className="font-semibold text-green-800 dark:text-green-200 mb-1">
            30-Day Money-Back Guarantee
          </h3>
          <p className="text-sm text-green-600 dark:text-green-300">
            Not satisfied? Get a full refund within 30 days, no questions asked.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
