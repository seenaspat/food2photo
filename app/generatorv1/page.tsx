"use client";

import { useEffect, useMemo, useState } from "react";
import FileUpload from "@/components/kokonutui/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Image as ImageIcon, RectangleHorizontal, RectangleVertical, Square, X } from "lucide-react";
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
	preset?: string; // varsv3 preset key (e.g., "diner-classic")
}


const v3BackgroundFiles = [
	"bg-v3-bbq-smokehouse-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-50-09-043Z-pldnkk.png",
	"bg-v3-boulangerie-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-52-21-734Z-w71t0z.png",
	"bg-v3-chinese-roast-shop-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-52-48-519Z-d8w1cw.png",
	"bg-v3-chiringuito-seafood-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-50-24-733Z-szr0bo.png",
	"bg-v3-deli-sandwich-bar-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-54-32-908Z-2wk6fy.png",
	"bg-v3-dim-sum-teahouse-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-50-16-189Z-nmonn5.png",
	"bg-v3-diner-classic-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-53-52-829Z-ciinl2.png",
	"bg-v3-farm-to-table-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-51-13-147Z-57kqm2.png",
	"bg-v3-finedining-warm-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-53-29-382Z-b5wfv0.png",
	"bg-v3-gelato-bar-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-54-25-166Z-bzyz28.png",
	"bg-v3-hot-pot-house-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-50-00-111Z-7yp6ep.png",
	"bg-v3-hotel-breakfast-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-50-42-042Z-k0aai1.png",
	"bg-v3-izakaya-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-52-31-497Z-xom2we.png",
	"bg-v3-kaiseki-minimal-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-53-04-675Z-lhqiwv.png",
	"bg-v3-mezze-middle-eastern-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-52-03-253Z-mrss9t.png",
	"bg-v3-open-kitchen-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-51-40-236Z-we44ad.png",
	"bg-v3-patisserie-modern-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-51-56-452Z-0ye19a.png",
	"bg-v3-pizzeria-napoletana-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-52-39-823Z-6uonfm.png",
	"bg-v3-ramen-shop-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-54-17-170Z-080vjj.png",
	"bg-v3-raw-bar-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-54-09-060Z-sj8mtm.png",
	"bg-v3-roastery-industrial-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-51-21-824Z-xfsx5c.png",
	"bg-v3-rooftop-terrace-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-52-55-865Z-6icg4n.png",
	"bg-v3-scandi-cafe-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-52-12-287Z-y0xkmt.png",
	"bg-v3-soju-bar-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-51-06-254Z-o5pe1o.png",
	"bg-v3-speakeasy-cocktail-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-51-30-707Z-e0sja6.png",
	"bg-v3-steakhouse-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-53-44-939Z-223933.png",
	"bg-v3-sushi-omakase-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-51-49-395Z-gsls4t.png",
	"bg-v3-tandoor-indian-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-53-12-317Z-fjyrop.png",
	"bg-v3-tapas-spanish-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-50-35-052Z-oeo06i.png",
	"bg-v3-taqueria-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-53-21-855Z-yv629s.png",
	"bg-v3-taverna-greek-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-50-58-005Z-4zew83.png",
	"bg-v3-tea-house-matcha-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-50-49-498Z-ilgvcg.png",
	"bg-v3-trattoria-italian-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-54-00-235Z-ngc8gi.png",
	"bg-v3-vietnamese-cafe-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-54-41-808Z-twg2fq.png",
	"bg-v3-wine-bar-enoteca-role-you-are-a-restaurant-ambience-stylist-for-2025-09-07T20-53-37-123Z-qiixms.png",
];

const slugToTitle = (slug: string): string => {
	return slug
		.split("-")
		.map((part) => (part.length ? part[0].toUpperCase() + part.slice(1) : part))
		.join(" ");
};

const backgroundOptions: BackgroundOption[] = [
	{ id: "none", label: "No background", thumb: "/opengraph-image.png" },
    ...v3BackgroundFiles.map((file) => {
        const id = file.replace(/\.png$/, "");
        const start = id.indexOf("bg-v3-") === 0 ? 6 : 0;
        const roleIdx = id.indexOf("-role-");
        const core = roleIdx > start ? id.substring(start, roleIdx) : id;
        const label = slugToTitle(core.replace(/^bg-v3-/, ""));
        return {
            id,
            label,
            thumb: `/backgrounds/v3-003/${file}`,
            preset: core.replace(/^bg-v3-/, ""),
        } satisfies BackgroundOption;
    }),
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
	const [dishPreviewUrl, setDishPreviewUrl] = useState<string | null>(null);
	const [selectedBackground, setSelectedBackground] = useState<string | null>(
		"none"
	);
	const [backgroundUpload, setBackgroundUpload] = useState<File | null>(null);
	const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<string | null>(null);
	const [styleHint, setStyleHint] = useState<string>();
	const [lens, setLens] = useState<Lens>("85mm/macro");
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
	const [outputMime, setOutputMime] = useState<string | null>(null);
	const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("1:1");
	const [preservePlate, setPreservePlate] = useState<boolean>(false);
	const canEnhance = useMemo(() => Boolean(uploaded), [uploaded]);

	// Local preview URLs
	useEffect(() => {
		if (!uploaded) {
			if (dishPreviewUrl) URL.revokeObjectURL(dishPreviewUrl);
			setDishPreviewUrl(null);
			return;
		}
		const url = URL.createObjectURL(uploaded);
		setDishPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [uploaded]);

	useEffect(() => {
		if (!backgroundUpload) {
			if (backgroundPreviewUrl) URL.revokeObjectURL(backgroundPreviewUrl);
			setBackgroundPreviewUrl(null);
			return;
		}
		const url = URL.createObjectURL(backgroundUpload);
		setBackgroundPreviewUrl(url);
		return () => URL.revokeObjectURL(url);
	}, [backgroundUpload]);

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
								onFileRemoveAction={() => setUploaded(null)}
								className="max-w-full"
							/>
							{uploaded ? (
								<div className="mt-3 flex items-center gap-3">
									<div className="size-16 overflow-hidden rounded border">
										{dishPreviewUrl ? (
											<img src={dishPreviewUrl} alt="Dish preview" className="h-full w-full object-cover" />
										) : null}
									</div>
									<p className="text-xs text-muted-foreground truncate flex-1">{uploaded.name}</p>
									<Button variant="ghost" size="sm" onClick={() => setUploaded(null)} aria-label="Remove dish image">
										<X className="h-4 w-4" />
									</Button>
								</div>
							) : (
								<p className="mt-2 text-xs text-muted-foreground">Choose a dish photo to begin</p>
							)}
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
																							? "border-primary ring-1 ring-primary overflow-hidden"
																							: "overflow-hidden"
																					}
																				>
																					<CardContent className="p-0">
																						<div className="aspect-square bg-muted/30 overflow-hidden flex items-center justify-center">
																							{bg.id === "none" ? (
																								<ImageIcon className="h-8 w-8 text-muted-foreground" />
																							) : (
																								<img src={bg.thumb} alt={bg.label} className="h-full w-full object-cover" />
																							)}
																						</div>
																						<div className="p-2 text-sm leading-5 h-10 overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{bg.label}</div>
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
													onFileRemoveAction={() => setBackgroundUpload(null)}
													className="max-w-full"
												/>
														{backgroundUpload ? (
															<div className="mt-3 flex items-center gap-3">
																<div className="size-16 overflow-hidden rounded border">
																	{backgroundPreviewUrl ? (
																		<img src={backgroundPreviewUrl} alt="Background preview" className="h-full w-full object-cover" />
																	) : null}
																</div>
																<p className="text-xs text-muted-foreground truncate flex-1">{backgroundUpload.name}</p>
																<Button variant="ghost" size="sm" onClick={() => setBackgroundUpload(null)} aria-label="Remove background image">
																	<X className="h-4 w-4" />
																</Button>
															</div>
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
							<div className="mt-4 flex items-center gap-2">
								<Checkbox id="preservePlate" checked={preservePlate} onCheckedChange={(v) => setPreservePlate(Boolean(v))} />
								<Label htmlFor="preservePlate" className="text-sm">Preserve plate</Label>
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
													if (backgroundUpload) {
														fd.append("background", backgroundUpload);
													} else if (selectedBackground && selectedBackground !== "none") {
														const selected = backgroundOptions.find((b) => b.id === selectedBackground);
														if (selected?.preset) {
															fd.append("bgPreset", selected.preset);
														}
													}
									fd.append("prompt", styleHint ?? "");
									fd.append("lensLook", lens);
									fd.append("aspectRatio", aspectRatio);
									fd.append("preservePlate", preservePlate ? "1" : "0");
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
