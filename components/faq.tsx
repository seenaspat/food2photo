"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { motion } from "motion/react";

const faqs: { q: string; a: string }[] = [
  {
    q: "What is Food2Photo?",
    a: "Food2Photo is your AI art director for food photography. It builds a realistic, professionally styled scene around your dish—ideal for menus, delivery apps, and social.",
  },
  {
    q: "Who is it for?",
    a: "Restaurants, cafés, meal-prep businesses, cloud kitchens, and food creators who want consistent, professional visuals without a full photoshoot.",
  },
  {
    q: "How does it work?",
    a: "Upload a photo of your dish, choose a background template, generate the shot and, if needed, add the final touch with a simple prompt.",
  },
  {
    q: "Can I keep my brand consistent?",
    a: "Yes. Pick preferred background templates to establish your look. The AI aims for a cohesive style across images (not pixel-identical). Lighting isn’t selected directly; background choice guides the overall aesthetic.",
  },
  {
    q: "Can I tweak the image?",
    a: "Yes. Use short prompts to add or remove small elements—like a garnish or utensil—or to make a campaign variant. Best used for final touches; one or two passes usually provide the cleanest results.",
  },
  {
    q: "How do I get the best results?",
    a: "Start with a sharp, well-lit photo on a clean background. Clear subjects with good contrast and minimal clutter produce the most realistic, professional outcomes.",
  },
  {
    q: "What do I get on export?",
    a: "Web-ready PNG or JPG in common aspect ratios (e.g., square and vertical) suitable for e-commerce, delivery apps, and social.",
  },
  {
    q: "How do I get started?",
    a: "Choose a plan on the pricing page to begin. There’s no free trial at the moment.",
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
          Frequently Asked Questions
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          Everything you need to know to start creating better product photos.
        </p><div className="mt-8">
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


