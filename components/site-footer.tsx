import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="w-full border-t">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-col gap-2">
          <Link href="/" className="font-semibold tracking-tight">Food2Photo</Link>
          <p className="text-muted-foreground text-sm">Realistic food photography from your dishes in one click.</p>
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


