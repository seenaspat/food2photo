import * as React from "react";
import clsx from "clsx";

interface HeroVideoBackgroundProps {
  children: React.ReactNode;
  src: string;
  posterSrc?: string;
  className?: string;
  overlayOpacity?: number;
}

export function HeroVideoBackground({
  children,
  src,
  posterSrc,
  className,
  overlayOpacity = 65,
}: HeroVideoBackgroundProps) {
  const overlayAlpha = Math.max(0, Math.min(100, overlayOpacity));
  return (
    <section className={clsx("relative isolate w-full", className)} aria-label="Sección principal">
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          poster={posterSrc}
          aria-hidden="true"
        >
          <source src={src} type="video/quicktime" />
          <source src={src} type="video/mp4" />
        </video>
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

export default HeroVideoBackground;


