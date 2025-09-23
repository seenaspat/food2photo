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
            title="Your Visual Style, Locked In."
            description="Create a consistent look across your entire menu. Our AI templates act as your brand's style guide, ensuring every photo—from your website to your delivery apps—shares a cohesive, professional aesthetic. No more random, mismatched shots."
            ctaHref="/generatorv1"
            ctaText="Find Your Style"
            desktopImageSrc="/feature2-main.webp"
            phoneImageSrc="/backgrounds/v3-003/bg-v3-chiringuito-seafood-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-50-24-733Z-szr0bo.png"
            reverse
          />
          <FeatureSplit
            title="The Final Touch is Yours."
            description="Use simple text prompts to add the final, creative touch. Add a side of fries, swap the plate, or see what a sprinkle of chili flakes looks like. It’s your tool to refine a great shot until it’s absolutely perfect."
            ctaHref="/generatorv1"
            ctaText="Add Your Touch"
            desktopImageSrc="/feature3-main.webp"
            phoneImageSrc="/backgrounds/v4-003/bg-v4-overhead-slate-minimal-sushi-role-you-are-a-topdown-food-photography-stylist-2025-09-08T10-13-06-842Z-u5iyra.png"
          />
          <FAQ />
        </div>
      </div>
    </main>
  );
}
