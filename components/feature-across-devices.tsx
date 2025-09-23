"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

export function FeatureAcrossDevices() {
  return (
    <section className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0% -10% 0%" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 py-12 sm:py-16 lg:grid-cols-2"
      >
        <div>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
          From Kitchen Counter to Pro Shot, Instantly.
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
          Why wait? Snap a photo of your dish the moment it's perfect and turn it into a stunning, styled shot right from your phone. Food2Photo is your on-the-spot art director, ensuring you never miss a chance to create mouth-watering content.
          </p>
          <div className="mt-8">
            <Link href="/generatorv1">
              <Button size="lg">Try It Now</Button>
            </Link>
          </div>
        </div>

        <div className="relative w-full mx-auto max-w-[460px] sm:max-w-none">
            {/* Desktop mock */}
            <div className="relative rounded-2xl shadow-2xl ring-1 ring-black/10">
              <Image
                src="/feature1-main.webp"
                alt="Lienzo de edición en escritorio con un bowl fresco"
                width={1024}
                height={768}
                className="h-auto w-full rounded-2xl object-cover"
                priority
              />
            </div>

            {/* Phone mock */}
            <div className="absolute -bottom-8 -left-8 w-[64%] max-w-[360px] sm:-bottom-12 sm:-left-24 sm:max-w-[380px]">
              <div className="relative rounded-2xl">
                <Image
                  src="/file-upload.webp"
                  alt="Vista móvil con composición de producto"
                  width={600}
                  height={900}
                  className="h-auto w-full rounded-2xl object-cover"
                />
              </div>
            </div>
          </div>
      </motion.div>
    </section>
  );
}

export default FeatureAcrossDevices;


