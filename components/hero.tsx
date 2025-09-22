import Link from "next/link";
import { Button } from "@/components/ui/button";
import HeroImageBackground from "@/components/hero-image-background";

export function Hero() {
  return (
    <HeroImageBackground
      src="/backgrounds/v4-003/bg-v4-overhead-dark-slate-holiday-role-you-are-a-topdown-food-photography-stylist-2025-09-08T10-12-52-963Z-1r8yiu.png"
      className="min-h-[72vh] sm:min-h-[78vh] lg:min-h-[86vh]"
      overlayOpacity={70}
    >
      <div className="mx-auto max-w-3xl text-center">
      
        <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Crea fotos de producto de comida que venden
        </h1>
        <p className="mt-4 text-pretty text-base text-white/90 sm:text-lg">
          Genera fondos realistas, escenografías y variaciones en segundos. Optimiza fichas de menú, anuncios y redes con imágenes consistentes y on‑brand.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/generatorv1" className="w-full sm:w-auto">
            <Button size="lg" className="w-full">
              Empieza gratis
            </Button>
          </Link>
          <Link href="/pricing" className="w-full sm:w-auto">
            <Button size="lg" variant="secondary" className="w-full bg-white/20 text-white hover:bg-white/30">
              Ver planes
            </Button>
          </Link>
        </div>
      
      </div>
    </HeroImageBackground>
  );
}
