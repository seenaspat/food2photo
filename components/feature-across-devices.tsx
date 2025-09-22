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
            Crea visuales en todos tus dispositivos
          </h2>
          <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
            Ya sea en escritorio o en movilidad, Food2Photo te permite crear y
            editar imágenes de producto en minutos: consistentes, realistas y
            listas para e‑commerce y social.
          </p>
          <div className="mt-8">
            <Link href="/generatorv1">
              <Button size="lg">Empieza gratis</Button>
            </Link>
          </div>
        </div>

        <div className="relative">
          <div className="relative rounded-3xl bg-amber-50 p-6 shadow-sm ring-1 ring-black/5">
            {/* Desktop mock */}
            <div className="relative rounded-2xl bg-black/5 shadow-2xl ring-1 ring-black/10">
              <Image
                src="/backgrounds/v4-003/bg-v4-overhead-bright-marble-role-you-are-a-topdown-food-photography-stylist-2025-09-08T10-12-29-403Z-rb1j4w.png"
                alt="Lienzo de edición en escritorio con un bowl fresco"
                width={1024}
                height={768}
                className="h-auto w-full rounded-2xl object-cover"
                priority
              />
              <div className="pointer-events-none absolute inset-0 flex items-start justify-start p-8">
                <span className="text-4xl font-extrabold uppercase tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)] sm:text-5xl">
                  FRESH & DELICIOUS
                </span>
              </div>
            </div>

            {/* Phone mock */}
            <div className="absolute -bottom-6 -left-6 w-[44%] max-w-[280px]">
              <div className="relative rounded-[2rem] bg-black/5 shadow-2xl ring-1 ring-black/10">
                <Image
                  src="/backgrounds/v4-003/bg-v4-overhead-dark-slate-holiday-role-you-are-a-topdown-food-photography-stylist-2025-09-08T10-12-52-963Z-1r8yiu.png"
                  alt="Vista móvil con composición de producto"
                  width={600}
                  height={900}
                  className="h-auto w-full rounded-[2rem] object-cover"
                />
                <div className="pointer-events-none absolute inset-0 flex items-start justify-start p-6">
                  <span className="text-xl font-extrabold uppercase tracking-tight text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.35)]">
                    FRESH & DELICIOUS
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}

export default FeatureAcrossDevices;


