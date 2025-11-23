"use client";

import React, { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselOptions {
	align?: "start" | "center";
	loop?: boolean;
}

interface CarouselContextValue {
	containerRef: React.RefObject<HTMLDivElement | null>;
	scrollBy: (direction: 1 | -1) => void;
	scrollToIndex: (index: number) => void;
	canScrollPrev: boolean;
	canScrollNext: boolean;
	currentIndex: number;
	align: "start" | "center";
	loop: boolean;
}

const CarouselContext = createContext<CarouselContextValue | null>(null);

function useCarousel() {
	const ctx = useContext(CarouselContext);
	if (!ctx) throw new Error("Carousel components must be used within <Carousel>");
	return ctx;
}

interface CarouselProps extends React.HTMLAttributes<HTMLDivElement> {
	opts?: CarouselOptions;
}

export function Carousel({ className, children, opts }: CarouselProps) {
	const containerRef = useRef<HTMLDivElement | null>(null);
	const [canScrollPrev, setCanScrollPrev] = useState(false);
	const [canScrollNext, setCanScrollNext] = useState(false);
	const [currentIndex, setCurrentIndex] = useState(0);

	const align = opts?.align ?? "start";
	const loop = opts?.loop ?? false;

	const updateScrollState = useCallback(() => {
		const el = containerRef.current;
		if (!el) return;
		const maxScrollLeft = el.scrollWidth - el.clientWidth;
		setCanScrollPrev(loop ? true : el.scrollLeft > 0);
		setCanScrollNext(loop ? true : el.scrollLeft < maxScrollLeft - 1);
		const index = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
		setCurrentIndex(index);
	}, [loop]);

	useEffect(() => {
		updateScrollState();
		const el = containerRef.current;
		if (!el) return;
		const onScroll = () => updateScrollState();
		el.addEventListener("scroll", onScroll, { passive: true });
		const ro = new ResizeObserver(updateScrollState);
		ro.observe(el);
		return () => {
			el.removeEventListener("scroll", onScroll);
			ro.disconnect();
		};
	}, [updateScrollState]);

	const scrollBy = useCallback(
		(direction: 1 | -1) => {
		const el = containerRef.current;
		if (!el) return;
		const step = Math.max(1, Math.round(el.clientWidth));
		const nextLeft = el.scrollLeft + direction * step;
		if (loop) {
			if (nextLeft < 0) el.scrollLeft = el.scrollWidth;
			else if (nextLeft > el.scrollWidth) el.scrollLeft = 0;
			else el.scrollTo({ left: nextLeft, behavior: "smooth" });
		} else {
			el.scrollTo({ left: nextLeft, behavior: "smooth" });
		}
		updateScrollState();
		},
		[loop, updateScrollState]
	);

	const scrollToIndex = useCallback((index: number) => {
		const el = containerRef.current;
		if (!el) return;
		el.scrollTo({ left: index * el.clientWidth, behavior: "smooth" });
		setCurrentIndex(index);
	}, []);

	const value = useMemo<CarouselContextValue>(
		() => ({ containerRef, scrollBy, scrollToIndex, canScrollPrev, canScrollNext, currentIndex, align, loop }),
		[scrollBy, scrollToIndex, canScrollPrev, canScrollNext, currentIndex, align, loop]
	);

	return (
		<div className={cn("relative", className)}>
			<CarouselContext.Provider value={value}>{children}</CarouselContext.Provider>
		</div>
	);
}

export function CarouselContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	const { containerRef, align } = useCarousel();
	return (
		<div
			ref={containerRef}
			className={cn(
				"flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory no-scrollbar",
				align === "center" ? "justify-center" : "",
				className
			)}
			{...props}
		/>
	);
}

export function CarouselItem({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
	return <div className={cn("snap-start shrink-0 w-full", className)} {...props} />;
}

export function CarouselPrevious({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const { scrollBy, canScrollPrev } = useCarousel();
	return (
		<button
			aria-label="Previous"
			type="button"
			onClick={() => scrollBy(-1)}
			disabled={!canScrollPrev}
			className={cn(
				"absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full z-10 rounded-full border bg-background/80 backdrop-blur p-2 shadow disabled:opacity-40",
				className
			)}
			{...props}
		>
			<ChevronLeft className="h-4 w-4" />
		</button>
	);
}

export function CarouselNext({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const { scrollBy, canScrollNext } = useCarousel();
	return (
		<button
			aria-label="Next"
			type="button"
			onClick={() => scrollBy(1)}
			disabled={!canScrollNext}
			className={cn(
				"absolute right-0 top-1/2 -translate-y-1/2 translate-x-full z-10 rounded-full border bg-background/80 backdrop-blur p-2 shadow disabled:opacity-40",
				className
			)}
			{...props}
		>
			<ChevronRight className="h-4 w-4" />
		</button>
	);
}

export function CarouselDots({ count, className }: { count: number; className?: string }) {
	const { currentIndex, scrollToIndex } = useCarousel();
	return (
		<div className={cn("flex items-center justify-center gap-2 mt-2", className)}>
			{Array.from({ length: count }).map((_, i) => (
				<button
					key={i}
					aria-label={`Ir a la página ${i + 1}`}
					onClick={() => scrollToIndex(i)}
					className={cn(
						"h-2.5 w-2.5 rounded-full transition-colors",
						currentIndex === i ? "bg-foreground" : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
					)}
				/>
			))}
		</div>
	);
}

export function CarouselControlPrevious({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const { scrollBy, canScrollPrev } = useCarousel();
	return (
		<button
			aria-label="Previous"
			type="button"
			onClick={() => scrollBy(-1)}
			disabled={!canScrollPrev}
			className={cn("rounded-full border bg-background/80 p-2 shadow disabled:opacity-40", className)}
			{...props}
		>
			<ChevronLeft className="h-4 w-4" />
		</button>
	);
}

export function CarouselControlNext({ className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
	const { scrollBy, canScrollNext } = useCarousel();
	return (
		<button
			aria-label="Next"
			type="button"
			onClick={() => scrollBy(1)}
			disabled={!canScrollNext}
			className={cn("rounded-full border bg-background/80 p-2 shadow disabled:opacity-40", className)}
			{...props}
		>
			<ChevronRight className="h-4 w-4" />
		</button>
	);
}
