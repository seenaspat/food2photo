import { FAQ } from "@/components/faq";
import { FeatureAcrossDevices } from "@/components/feature-across-devices";
import { FeatureSplit } from "@/components/feature-split";
import { Hero } from "@/components/hero";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center">
      <div className="flex-1 w-full flex flex-col gap-12 items-center">
        <Hero />
        <section id="features" className="flex-1 flex flex-col gap-12 w-full p-5 scroll-mt-[var(--navbar-h,64px)]">
          <FeatureAcrossDevices />
          <FeatureSplit
            title="Your Visual Style, Locked In."
            description="Create a consistent look across your entire menu. Our AI templates act as your brand's style guide, ensuring every photo—from your website to your delivery apps—shares a cohesive, professional aesthetic. No more random, mismatched shots."
            ctaHref="/dashboard"
            ctaText="Find Your Style"
            desktopImageSrc="/feature2-main.webp"
            reverse
          />
          <FeatureSplit
            title="The Final Touch is Yours."
            description="Use simple text prompts to add the final, creative touch. Add a side of fries, swap the plate, or see what a sprinkle of chili flakes looks like. It's your tool to refine a great shot until it's absolutely perfect."
            ctaHref="/dashboard"
            ctaText="Add Your Touch"
            desktopImageSrc="/feature3-main.webp"
          />
          <FAQ />
        </section>
      </div>
    </main>
  );
}
