"use client";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "motion/react";

interface FeatureSplitProps {
  title: string;
  description: string;
  ctaHref: string;
  ctaText: string;
  desktopImageSrc: string;
  phoneImageSrc: string;
  reverse?: boolean;
}

export function FeatureSplit({
  title,
  description,
  ctaHref,
  ctaText,
  desktopImageSrc,
  phoneImageSrc,
  reverse = false,
}: FeatureSplitProps) {
  return (
    <section className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0% -10% 0%" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-5 py-12 sm:py-16 lg:grid-cols-2"
      >
        <div className={reverse ? "lg:order-2" : undefined}>
          <h2 className="text-balance text-3xl font-semibold tracking-tight sm:text-4xl">
            {title}
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            {description}
          </p>
          <div className="mt-8">
            <Link href={ctaHref}>
              <Button size="lg">{ctaText}</Button>
            </Link>
          </div>
        </div>

        <div className={reverse ? "lg:order-1" : undefined}>
            <div className="relative rounded-2xl">
              <Image
                src={desktopImageSrc}
                alt="Desktop editing example"
                width={1200}
                height={800}
                className="h-auto w-full rounded-2xl object-cover"
                priority
              />

          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default FeatureSplit;


