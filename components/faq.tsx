"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "motion/react";

const faqs: { q: string; a: string }[] = [
  {
    q: "¿Qué es Food2Photo?",
    a: "Es un generador de fondos y composiciones para fotos de comida. Crea visuales realistas y consistentes para e‑commerce, anuncios y redes en segundos.",
  },
  {
    q: "¿Puedo usarlo gratis?",
    a: "Sí. Empieza gratis con un plan de prueba. Luego puedes elegir un plan de pago según tu volumen y necesidades.",
  },
  {
    q: "¿Genera variantes y tamaños en batch?",
    a: "Sí. Puedes crear múltiples fondos, recortes y formatos automáticamente para marketplaces y social.",
  },
  {
    q: "¿Puedo mantener mi branding?",
    a: "Puedes configurar plantillas, fondos preferidos y estilos para mantener consistencia con tu marca.",
  },
  {
    q: "¿Qué formatos exporta?",
    a: "PNG y JPG listos para web, con tamaños optimizados para e‑commerce y redes sociales.",
  },
];

export function FAQ() {
  return (
    <section className="w-full">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10% 0% -10% 0%" }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="mx-auto max-w-3xl px-5 py-12 sm:py-16"
      >
        <h2 className="text-balance text-center text-3xl font-semibold tracking-tight sm:text-4xl">
          Preguntas frecuentes
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Todo lo que necesitas saber para empezar a crear mejores fotos de producto.
        </p>
        <div className="mt-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((item, idx) => (
              <AccordionItem key={idx} value={`item-${idx}`}>
                <AccordionTrigger>{item.q}</AccordionTrigger>
                <AccordionContent>{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </motion.div>
    </section>
  );
}

export default FAQ;


