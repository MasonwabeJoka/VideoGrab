import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Zap, Shield, Smartphone, HardDrive } from "lucide-react"

export function FeatureSection() {
  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Download videos quickly with our optimized servers and fast processing.",
    },
    {
      icon: Shield,
      title: "Safe & Secure",
      description: "Your privacy is protected. We don't store your data or downloaded videos.",
    },
    {
      icon: Smartphone,
      title: "All Devices",
      description: "Works perfectly on desktop, tablet, and mobile devices.",
    },
    {
      icon: HardDrive,
      title: "Multiple Formats",
      description: "Download in various qualities and formats to suit your needs.",
    },
  ]

  return (
    <section id="features" className="py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Why Choose VideoGrab?</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          We provide the best YouTube downloading experience with these amazing features
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {features.map((feature, index) => (
          <Card key={index} className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="mx-auto w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-red-500" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  )
}
