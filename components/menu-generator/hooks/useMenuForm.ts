"use client";

/**
 * useMenuForm Hook
 * 
 * Manages menu form state with Zod validation.
 * Provides helpers for CRUD operations on sections and items.
 */

import {
  createDefaultMenuInput,
  createEmptyMenuSection,
  menuInputSchema,
  type MenuInput,
  type MenuSection,
  type RestaurantType,
} from "@/lib/menu";
import { useCallback, useMemo, useState } from "react";

interface UseMenuFormReturn {
  // State
  data: MenuInput;
  errors: Record<string, string[]>;
  isValid: boolean;

  // Restaurant type
  setRestaurantType: (type: RestaurantType) => void;

  // Restaurant name
  setRestaurantName: (name: string) => void;

  // Vibe description (AI-driven design)
  setVibeDescription: (vibe: string) => void;

  // Sections
  updateSection: (index: number, section: MenuSection) => void;
  addSection: () => void;
  removeSection: (index: number) => void;

  // Validation
  validate: () => boolean;
  reset: () => void;

  // Items with images (for credit calculation)
  itemsWithImages: number;
  totalCredits: number;
}

export function useMenuForm(initialData?: Partial<MenuInput>): UseMenuFormReturn {
  const [data, setData] = useState<MenuInput>(() => ({
    ...createDefaultMenuInput(),
    ...initialData,
  }));

  const [errors, setErrors] = useState<Record<string, string[]>>({});

  const setRestaurantType = useCallback((type: RestaurantType) => {
    // Selecting a preset clears the vibe description (mutually exclusive)
    setData((prev) => ({ ...prev, restaurantType: type, vibeDescription: undefined }));
  }, []);

  const setRestaurantName = useCallback((name: string) => {
    setData((prev) => ({ ...prev, restaurantName: name || undefined }));
  }, []);

  const setVibeDescription = useCallback((vibe: string) => {
    // Setting vibe description clears the preset (mutually exclusive)
    setData((prev) => ({ ...prev, vibeDescription: vibe || undefined, restaurantType: undefined }));
  }, []);

  const updateSection = useCallback((index: number, section: MenuSection) => {
    setData((prev) => {
      const newSections = [...prev.sections];
      newSections[index] = section;
      return { ...prev, sections: newSections };
    });
  }, []);

  const addSection = useCallback(() => {
    setData((prev) => {
      if (prev.sections.length >= 5) return prev; // Max 5 sections
      return {
        ...prev,
        sections: [...prev.sections, createEmptyMenuSection()],
      };
    });
  }, []);

  const removeSection = useCallback((index: number) => {
    setData((prev) => {
      if (prev.sections.length <= 1) return prev; // Keep at least 1 section
      return {
        ...prev,
        sections: prev.sections.filter((_, i) => i !== index),
      };
    });
  }, []);

  const validate = useCallback((): boolean => {
    const result = menuInputSchema.safeParse(data);
    if (result.success) {
      setErrors({});
      return true;
    }

    // Convert Zod errors to simple Record
    const newErrors: Record<string, string[]> = {};
    for (const issue of result.error.issues) {
      const path = issue.path.join(".");
      if (!newErrors[path]) {
        newErrors[path] = [];
      }
      newErrors[path].push(issue.message);
    }
    setErrors(newErrors);
    return false;
  }, [data]);

  const reset = useCallback(() => {
    setData(createDefaultMenuInput());
    setErrors({});
  }, []);

  // Calculate items with images for credit display
  const itemsWithImages = useMemo(() => {
    return data.sections.flatMap((s) => s.items).filter((i) => i.imageFile || i.imageUrl).length;
  }, [data.sections]);

  // Total credits: 1 for menu generation, +1 for photo integration if any images
  const totalCredits = useMemo(() => {
    return itemsWithImages > 0 ? 2 : 1;
  }, [itemsWithImages]);

  const isValid = useMemo(() => {
    return menuInputSchema.safeParse(data).success;
  }, [data]);

  return {
    data,
    errors,
    isValid,
    setRestaurantType,
    setRestaurantName,
    setVibeDescription,
    updateSection,
    addSection,
    removeSection,
    validate,
    reset,
    itemsWithImages,
    totalCredits,
  };
}
