import Link from "next/link"
import { Download } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center max-w-md mx-auto">
          <Link href="/" className="flex items-center justify-center gap-2 font-bold text-xl mb-4">
            <Download className="w-6 h-6 text-red-500" />
            <span>VideoGrab</span>
          </Link>
          <p className="text-gray-600">
            The fastest and most reliable YouTube video downloader. Download your favorite videos in high quality.
          </p>
        </div>
      </div>
    </footer>
  )
}
