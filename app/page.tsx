import { Hero } from "@/components/hero";
import { FeatureAcrossDevices } from "@/components/feature-across-devices";
import { FeatureSplit } from "@/components/feature-split";
import { FAQ } from "@/components/faq";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-12 items-center">
        {/* Navbar moved to RootLayout via <SiteNavbar /> */}
        <Hero />
        <div className="flex-1 flex flex-col gap-12 w-full p-5">
          <FeatureAcrossDevices />
          <FeatureSplit
            title="Plantillas y fondos consistentes"
            description="Acelera la producción con plantillas y fondos IA coherentes. Mantén tu marca constante en catálogo, anuncios y redes."
            ctaHref="/generatorv1"
            ctaText="Probar plantillas"
            desktopImageSrc="/backgrounds/v4-003/bg-v4-overhead-blue-painted-wood-role-you-are-a-topdown-food-photography-stylist-2025-09-08T10-10-10-552Z-oceawa.png"
            phoneImageSrc="/backgrounds/v4-003/bg-v4-overhead-linen-bistro-role-you-are-a-topdown-food-photography-stylist-2025-09-08T10-12-21-500Z-v6i0ux.png"
            reverse
          />
          <FeatureSplit
            title="Batch y variantes en segundos"
            description="Genera múltiples composiciones y tamaños de forma automática. Publica más rápido en marketplaces y social sin perder calidad."
            ctaHref="/generatorv1"
            ctaText="Generar en batch"
            desktopImageSrc="/backgrounds/v4-003/bg-v4-overhead-concrete-autumn-role-you-are-a-topdown-food-photography-stylist-2025-09-08T10-11-20-213Z-rub58k.png"
            phoneImageSrc="/backgrounds/v4-003/bg-v4-overhead-slate-minimal-sushi-role-you-are-a-topdown-food-photography-stylist-2025-09-08T10-13-06-842Z-u5iyra.png"
          />
          <FAQ />
        </div>
      </div>
    </main>
  );
}
