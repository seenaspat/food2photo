import * as React from "react";
import Image from "next/image";
import clsx from "clsx";

interface HeroImageBackgroundProps {
  children: React.ReactNode;
  src: string;
  alt?: string;
  className?: string;
  overlayOpacity?: number;
}

export function HeroImageBackground({
  children,
  src,
  alt = "Hero background",
  className,
  overlayOpacity = 65,
}: HeroImageBackgroundProps) {
  const overlayAlpha = Math.max(0, Math.min(100, overlayOpacity));
  return (
    <section className={clsx("relative isolate w-full", className)} aria-label="Sección principal">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <Image src={src} alt={alt} fill priority className="object-cover" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.50) 100%)",
            opacity: overlayAlpha / 100,
          }}
          aria-hidden="true"
        />
      </div>
      <div className="relative mx-auto max-w-6xl px-5 py-16 sm:py-24 lg:py-28">
        {children}
      </div>
    </section>
  );
}

export default HeroImageBackground;


