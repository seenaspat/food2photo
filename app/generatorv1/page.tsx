"use client";

import { useMemo, useState } from "react";
import FileUpload from "@/components/kokonutui/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Download, Image as ImageIcon } from "lucide-react";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "../../components/ui/carousel";
import { CarouselDots } from "../../components/ui/carousel";

interface BackgroundOption {
	id: string;
	label: string;
	thumb: string; // placeholder URL
}

/**
 * Background options for the generator
 */
const backgroundOptions: BackgroundOption[] = [
	{ id: "none", label: "No background", thumb: "/opengraph-image.png" },
	{ id: "wood", label: "Wood", thumb: "/opengraph-image.png" },
	{ id: "dark", label: "Dark Restaurant", thumb: "/opengraph-image.png" },
	{ id: "outdoor", label: "Outdoor", thumb: "/opengraph-image.png" },
	{ id: "concrete", label: "Concrete", thumb: "/opengraph-image.png" },
    { id: "table", label: "Table", thumb: "/opengraph-image.png" },
    { id: "plate", label: "Plate", thumb: "/opengraph-image.png" },
    { id: "orange", label: "Orange", thumb: "/opengraph-image.png" },
    { id: "light", label: "Light", thumb: "/opengraph-image.png" },
    { id: "paper", label: "Paper", thumb: "/opengraph-image.png" },
];

const styleSuggestions = [
	"bright editorial, soft natural light",
	"seafood restaurant",
	"american diner",
	"neon lights",
];

const lensOptions = ["35mm", "50mm", "85mm", "85mm/macro"] as const;

type Lens = typeof lensOptions[number];

export default function GeneratorV1Page() {
	const [uploaded, setUploaded] = useState<File | null>(null);
	const [selectedBackground, setSelectedBackground] = useState<string | null>(
		"none"
	);
	const [styleHint, setStyleHint] = useState<string>(styleSuggestions[0]);
	const [lens, setLens] = useState<Lens>("50mm");
	const canEnhance = useMemo(() => Boolean(uploaded), [uploaded]);

	// Split backgrounds into pages of 3x3 (9 items per page)
	const backgroundPages = useMemo(() => {
		const pageSize = 9;
		const pages: (BackgroundOption | null)[][] = [];
		const optionsCount = backgroundOptions.length;
		const pageCount = Math.ceil(optionsCount / pageSize);

		for (let i = 0; i < pageCount; i++) {
			const start = i * pageSize;
			const end = start + pageSize;
			const page: (BackgroundOption | null)[] = backgroundOptions.slice(start, end);
			// Pad the last page with nulls to ensure a full 3x3 grid
			while (page.length < pageSize) {
				page.push(null);
			}
			pages.push(page);
		}
		if (pages.length === 0) {
			pages.push(Array(pageSize).fill(null));
		}
		return pages;
	}, []);

	return (
		<div className="container mx-auto px-4 py-6">
			<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<div className="space-y-6">
					<Card>
						<CardHeader>
							<CardTitle>
								1) Dish Photo <span className="text-red-500">(required)</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<FileUpload
								uploadDelay={0}
								acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
								onUploadSuccessAction={setUploaded}
								className="max-w-full"
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>2) Background</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="mb-3">
								<div className="inline-flex items-center gap-3">
									<Badge variant="secondary">Gallery</Badge>
									<Badge variant="outline">Upload</Badge>
								</div>
							</div>
							<div className="w-full">
								<Carousel
									opts={{ align: "start", loop: false }}
									className="w-full"
								>
									<div className="flex items-center justify-center gap-4">
										<CarouselPrevious className="static inset-auto translate-x-0 translate-y-0 shrink-0" />
										<div className="flex-1 overflow-hidden">
											<CarouselContent>
												{backgroundPages.map((page, pageIndex) => (
													<CarouselItem key={pageIndex} className="basis-full">
														<div className="grid grid-cols-3 gap-3">
															{page.map((bg, itemIndex) =>
																bg ? (
																	<button
																		key={bg.id}
																		onClick={() => setSelectedBackground(bg.id)}
																		className="text-left"
																	>
																		<Card
																			className={
																				selectedBackground === bg.id
																					? "border-primary ring-1 ring-primary"
																					: ""
																			}
																		>
																			<CardContent className="p-0">
																				<div className="aspect-square bg-muted/30 flex items-center justify-center">
																					<ImageIcon className="h-8 w-8 text-muted-foreground" />
																				</div>
																				<div className="p-2 text-sm">{bg.label}</div>
																			</CardContent>
																		</Card>
																	</button>
																) : (
																	<div key={`placeholder-${pageIndex}-${itemIndex}`} />
																)
															)}
														</div>
													</CarouselItem>
												))}
											</CarouselContent>
										</div>
										<CarouselNext className="static inset-auto translate-x-0 translate-y-0 shrink-0" />
									</div>
									<CarouselDots count={backgroundPages.length} className="mt-4" />
								</Carousel>
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>3) Optional Style Hint</CardTitle>
						</CardHeader>
						<CardContent>
							<Textarea
								value={styleHint}
								onChange={(e) => setStyleHint(e.target.value)}
								maxLength={250}
								placeholder="Describe el estilo..."
							/>
							<div className="mt-2 text-xs text-muted-foreground flex justify-between">
								<span>Sugerencias:</span>
								<span>{styleHint.length}/250</span>
							</div>
							<div className="mt-2 flex flex-wrap gap-2">
								{styleSuggestions.slice(1).map((s) => (
									<Button key={s} variant="secondary" size="sm" onClick={() => setStyleHint(s)}>
										{s}
									</Button>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>5) Aspect Ratio</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="flex flex-wrap gap-2">
								{lensOptions.map((opt) => (
									<Button
										key={opt}
										variant={lens === opt ? "default" : "outline"}
										onClick={() => setLens(opt)}
									>
										{opt}
									</Button>
								))}
							</div>
						</CardContent>
					</Card>

					<Button className="w-full" size="lg" disabled={!canEnhance}>
						Enhance Photo
					</Button>
				</div>

				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>Preview</span>
								<span className="text-xs font-normal text-muted-foreground">Lens: {lens} · Output: 2028 px</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="aspect-square rounded-md border flex items-center justify-center bg-muted">
								<ImageIcon className="h-10 w-10 text-muted-foreground" />
							</div>
							<div className="mt-4 flex items-center gap-2">
								<Button className="gap-2">
									<Download className="h-4 w-4" /> Download
								</Button>
								<Input className="w-28" value="JPEG" readOnly />
								<Button variant="outline">PN.1</Button>
								<Button variant="ghost">View original</Button>
							</div>
							<p className="mt-2 text-xs text-muted-foreground">Ready. Render time: 11.4s</p>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
