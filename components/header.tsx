import Link from "next/link"
import { Download } from "lucide-react"

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <Download className="w-6 h-6 text-red-500" />
          <span>VideoGrab</span>
        </Link>
      </div>
    </header>
  )
}
