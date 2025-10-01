import * as React from "react";
import Image from "next/image";
import clsx from "clsx";

interface HeroImageBackgroundProps {
  children: React.ReactNode;
  src: string;
  mobileSrc?: string;
  objectPosition?: string;
  mobileObjectPosition?: string;
  hideBackgroundBelowLg?: boolean;
  alt?: string;
  className?: string;
  overlayOpacity?: number;
  overlayImageSrc?: string;
  overlayImageAlt?: string;
  overlayImageClassName?: string;
}

export function HeroImageBackground({
  children,
  src,
  mobileSrc,
  objectPosition,
  mobileObjectPosition,
  hideBackgroundBelowLg,
  alt = "Hero background",
  className,
  overlayOpacity = 65,
  overlayImageSrc,
  overlayImageAlt = "Hero overlay",
  overlayImageClassName,
}: HeroImageBackgroundProps) {
  const overlayAlpha = Math.max(0, Math.min(100, overlayOpacity));
  return (
    <section className={clsx("relative isolate w-full", className)} aria-label="Sección principal">
      <div className={clsx("absolute inset-0 -z-10 overflow-hidden", hideBackgroundBelowLg && "hidden lg:block") }>
        {mobileSrc ? (
          <>
            <Image src={mobileSrc} alt={alt} fill priority sizes="100vw" style={{ objectPosition: mobileObjectPosition ?? objectPosition }} className="object-contain w-full h-full block lg:hidden" />
            <Image src={src} alt={alt} fill priority sizes="(min-width: 1024px) 100vw, 0px" style={{ objectPosition }} className="object-cover hidden lg:block" />
          </>
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            priority
            sizes="(min-width: 1024px) 100vw, 0px"
            style={{ objectPosition }}
            className="object-cover"
          />
        )}
        {overlayAlpha > 0 ? (
          <div
            className="absolute inset-0 hidden lg:block"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.50) 100%)",
              opacity: overlayAlpha / 100,
            }}
            aria-hidden="true"
          />
        ) : null}
      </div>
      {overlayImageSrc ? (
        <div className="pointer-events-none absolute inset-0">
          <Image
            src={overlayImageSrc}
            alt={overlayImageAlt}
            fill
            priority
            sizes="(min-width: 1024px) 50vw, 100vw"
            className={clsx("object-contain object-right", overlayImageClassName)}
          />
        </div>
      ) : null}
      <div className="relative mx-auto max-w-6xl px-5 pt-14 pb-4 sm:pt-20 sm:pb-16 lg:pt-32 lg:pb-28">
        {children}
      </div>
    </section>
  );
}

export default HeroImageBackground;


