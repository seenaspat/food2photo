"use client";

import { useMemo, useState } from "react";
import FileUpload from "@/components/kokonutui/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Image as ImageIcon, RectangleHorizontal, RectangleVertical, Square } from "lucide-react";
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

const lensOptions = ["35mm", "50mm", "85mm/macro"] as const;

type Lens = typeof lensOptions[number];
const aspectRatioOptions = [
    { id: "3:2", label: "3:2", icon: RectangleHorizontal },
    { id: "1:1", label: "1:1", icon: Square },
    { id: "4:5", label: "4:5", icon: RectangleVertical },
    { id: "16:9", label: "16:9", icon: RectangleHorizontal },
    { id: "9:16", label: "9:16", icon: RectangleVertical },
] as const;
type AspectRatioId = typeof aspectRatioOptions[number]["id"];

export default function GeneratorV1Page() {
	const [uploaded, setUploaded] = useState<File | null>(null);
	const [selectedBackground, setSelectedBackground] = useState<string | null>(
		"none"
	);
	const [backgroundUpload, setBackgroundUpload] = useState<File | null>(null);
	const [styleHint, setStyleHint] = useState<string>();
	const [lens, setLens] = useState<Lens>("85mm/macro");
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
	const [outputMime, setOutputMime] = useState<string | null>(null);
	const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("1:1");
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
							<div className="w-full">
								<Tabs defaultValue="gallery" className="w-full">
									<TabsList>
										<TabsTrigger value="gallery">Gallery</TabsTrigger>
										<TabsTrigger value="upload">Upload</TabsTrigger>
									</TabsList>
									<TabsContent value="gallery">
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
																<div className="p-1 grid grid-cols-3 gap-3">
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
									</TabsContent>
									<TabsContent value="upload">
										<div className="space-y-3">
											<FileUpload
													uploadDelay={0}
													acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
													onUploadSuccessAction={(file) => {
														setBackgroundUpload(file)
														setSelectedBackground("none")
													}}
													className="max-w-full"
												/>
											{backgroundUpload ? (
												<p className="text-xs text-muted-foreground">Uploaded: {backgroundUpload.name}</p>
											) : (
												<p className="text-xs text-muted-foreground">Upload a custom background image.</p>
											)}
										</div>
									</TabsContent>
								</Tabs>
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
								placeholder="Describe details of the image scenery, style, etc."
							/>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>4) Lens Look</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="grid grid-cols-3 gap-3">
								{lensOptions.map((opt) => (
									<button key={opt} onClick={() => setLens(opt)} className="text-left">
										<Card className={lens === opt ? "border-primary ring-1 ring-primary" : ""}>
											<CardContent className="p-0">
												<div className="aspect-square bg-muted/30 flex items-center justify-center">
													<ImageIcon className="h-8 w-8 text-muted-foreground" />
												</div>
												<div className="p-2 text-sm">{opt}</div>
											</CardContent>
										</Card>
									</button>
								))}
							</div>
						</CardContent>
					</Card>

					<Card>
						<CardHeader>
							<CardTitle>5) Aspect Ratio</CardTitle>
						</CardHeader>
						<CardContent>
							<Carousel opts={{ align: "start", loop: false }} className="w-full">
								<div className="flex items-center justify-center gap-4">
									{/* <CarouselPrevious className="static inset-auto translate-x-0 translate-y-0 shrink-0" /> */}
									<div className="flex-1 overflow-hidden">
										<CarouselContent>
											{aspectRatioOptions.map((opt) => {
												const Icon = opt.icon;
												return (
													<CarouselItem key={opt.id} className="p-1 basis-1/3 sm:basis-1/4 md:basis-1/5 lg:basis-1/6">
														<button onClick={() => setAspectRatio(opt.id)} className="text-left w-full">
															<Card className={aspectRatio === opt.id ? "border-primary ring-1 ring-primary" : ""}>
																<CardContent className="p-0">
																	<div className="aspect-square bg-muted/30 flex items-center justify-center">
																		<Icon className="h-8 w-8 text-muted-foreground" />
																	</div>
																	<div className="p-2 text-sm">{opt.label}</div>
																</CardContent>
															</Card>
														</button>
													</CarouselItem>
												);
											})}
										</CarouselContent>
									</div>
									{/* <CarouselNext className="static inset-auto translate-x-0 translate-y-0 shrink-0" /> */}
								</div>
							</Carousel>
						</CardContent>
					</Card>

					<Button
							className="w-full"
							size="lg"
							disabled={!canEnhance || isGenerating}
							onClick={async () => {
								if (!uploaded) return;
								try {
									setIsGenerating(true);
									setGeneratedImageUrl(null);
									const fd = new FormData();
									fd.append("dish", uploaded);
									if (backgroundUpload) fd.append("background", backgroundUpload);
									fd.append("prompt", styleHint);
									fd.append("lensLook", lens);
									fd.append("aspectRatio", aspectRatio);
									const resp = await fetch("/api/generate", { method: "POST", body: fd });
									if (!resp.ok) {
										throw new Error(`Generation failed: ${resp.status}`);
									}
									const blob = await resp.blob();
									setOutputMime(blob.type || null);
									const url = URL.createObjectURL(blob);
									setGeneratedImageUrl(url);
								} catch (e) {
									console.error(e);
								} finally {
									setIsGenerating(false);
								}
							}}
						>
							{isGenerating ? "Enhancing..." : "Enhance Photo"}
						</Button>
				</div>

				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>Preview</span>
								<span className="text-xs font-normal text-muted-foreground">Lens: {lens} · Ratio: {aspectRatio}</span>
							</CardTitle>
						</CardHeader>
						<CardContent>
							{generatedImageUrl ? (
								<img src={generatedImageUrl} alt="Generated" className="aspect-square w-full rounded-md border object-cover" />
							) : (
								<div className="aspect-square rounded-md border flex items-center justify-center bg-muted">
									<ImageIcon className="h-10 w-10 text-muted-foreground" />
								</div>
							)}
							<div className="mt-4 flex items-center gap-2">
								{generatedImageUrl ? (
									<a href={generatedImageUrl} download className="inline-flex">
										<Button className="gap-2" asChild>
											<span>
												<Download className="h-4 w-4" /> Download
											</span>
										</Button>
									</a>
								) : (
									<Button className="gap-2" disabled>
										<Download className="h-4 w-4" /> Download
									</Button>
								)}
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</div>
	);
}
