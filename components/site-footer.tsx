import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Instagram, Twitter } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="w-full border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Link href="/" className="font-semibold tracking-tight">Food2Photo</Link>
          <p className="text-muted-foreground text-sm">AI-enhanced food photography from your real dishes.</p>
          <div className="flex items-center gap-3 mt-1">
            <Button asChild variant="ghost" size="icon" aria-label="Twitter">
              <Link href="https://x.com/food2photo" target="_blank" rel="noreferrer">
                <Twitter className="size-4" />
              </Link>
            </Button>
            <Button asChild variant="ghost" size="icon" aria-label="Instagram">
              <Link href="https://instagram.com/food2photoapp" target="_blank" rel="noreferrer">
                <Instagram className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-2 text-sm md:text-right">
          <div className="flex items-center gap-4 md:justify-end">
            <Link href="/terms" className="hover:underline">Terms & Conditions</Link>
            <Link href="/privacy" className="hover:underline">Privacy</Link>
            <Link href="/contact" className="hover:underline">Contact</Link>
          </div>
          <p className="text-muted-foreground">© {new Date().getFullYear()} Food2Photo. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

export default SiteFooter;


