import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import HeroImageBackground from "@/components/hero-image-background";

export function Hero() {
  return (
    <>
    <HeroImageBackground
      src="/hero-bg.webp"
      hideBackgroundBelowLg
      className="lg:min-h-[90vh]"
      objectPosition="center 20%"
      overlayOpacity={0}
    >
      <div className="mx-auto max-w-6xl px-5 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-10">
          <div className="text-left max-w-xl">
            <h1 className="mt-0 text-balance text-4xl font-semibold tracking-tight text-zinc-900 dark:text-white lg:dark:text-zinc-900 sm:text-5xl">
            From Your Phone to a Pro Photoshoot. In Seconds.
            </h1>
            <p className="mt-4 text-pretty text-base text-zinc-700 dark:text-zinc-200 lg:dark:text-zinc-700 sm:text-lg">
            Food2Photo is your AI food stylist. Upload a photo of any dish, and our app will compose it into an authentic, professional scene, ready for your menu, ads, or social media.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-start">
              <Link href="/generatorv1" className="sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto">
                  Start Creating Now
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </HeroImageBackground>
    <div className="block lg:hidden -mt-3 w-full">
      <Image
        src="/hero-mobile.webp"
        alt="Product shot in mobile format"
        width={1600}
        height={900}
        priority
        className="h-auto w-full"
      />
    </div>
    </>
  );
}
