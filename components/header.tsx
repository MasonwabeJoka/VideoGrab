import Link from "next/link";
import { Download, Crown } from "lucide-react";
import { Button } from "./ui/button";

export function Header() {
  return (
    <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Download className="w-6 h-6 text-red-500" />
            <span>VideoBoom</span>
          </Link>

          {/* Premium Navigation - Commented Out */}
          {/* <nav className="flex items-center gap-4">
            <Link href="/premium">
              <Button
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <Crown className="w-4 h-4 text-yellow-500" />
                Premium
              </Button>
            </Link>
          </nav> */}
        </div>
      </div>
    </header>
  );
}
