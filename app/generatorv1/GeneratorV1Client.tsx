"use client";

import { useEffect, useMemo, useState } from "react";
import FileUpload from "@/components/kokonutui/file-upload";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Image as ImageIcon, RectangleHorizontal, RectangleVertical, Square, X, Search, Info } from "lucide-react";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	CarouselNext,
	CarouselPrevious,
} from "../../components/ui/carousel";
import { CarouselDots } from "../../components/ui/carousel";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handle = setTimeout(() => setDebouncedValue(value), delayMs);
    return () => clearTimeout(handle);
  }, [value, delayMs]);
  return debouncedValue;
}

interface BackgroundOption {
	id: string;
	label: string;
	thumb: string;
	preset?: string; // varsv3 preset key (e.g., "diner-classic")
}

export interface CatalogItemLite { id: string; label: string; thumbUrl: string }

interface Props {
	ambienceItems: CatalogItemLite[];
	topdownItems: CatalogItemLite[];
}

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

export default function GeneratorV1Client({ ambienceItems, topdownItems }: Props) {
	const [uploaded, setUploaded] = useState<File | null>(null);
	const [dishPreviewUrl, setDishPreviewUrl] = useState<string | null>(null);
	const [selectedBackground, setSelectedBackground] = useState<string | null>("none");
	const [backgroundUpload, setBackgroundUpload] = useState<File | null>(null);
	const [backgroundPreviewUrl, setBackgroundPreviewUrl] = useState<string | null>(null);
	const [styleHint, setStyleHint] = useState<string>();
	const [lens, setLens] = useState<Lens>("85mm/macro");
	const [isGenerating, setIsGenerating] = useState<boolean>(false);
	const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
	const [aspectRatio, setAspectRatio] = useState<AspectRatioId>("1:1");
	const [preservePlate, setPreservePlate] = useState<boolean>(false);
	const [selectedTopdownRef, setSelectedTopdownRef] = useState<string | null>(null);
	const canEnhance = useMemo(() => Boolean(uploaded), [uploaded]);

	// Search queries for filtering backgrounds
	const [ambienceQuery, setAmbienceQuery] = useState<string>("");
	const [topdownQuery, setTopdownQuery] = useState<string>("");

	const ambienceQueryDebounced = useDebouncedValue(ambienceQuery, 300);
	const topdownQueryDebounced = useDebouncedValue(topdownQuery, 300);

	const backgroundOptions: BackgroundOption[] = useMemo(() => {
		const opts: BackgroundOption[] = [
			{ id: "none", label: "No background", thumb: "/opengraph-image.png" },
		];
		for (const it of ambienceItems) {
			opts.push({ id: `v3:${it.id}`, label: it.label, thumb: it.thumbUrl, preset: it.id });
		}
		return opts;
	}, [ambienceItems]);

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

	// Filter ambience backgrounds by query (keeping the "none" option at the top)
	const filteredBackgroundOptions: BackgroundOption[] = useMemo(() => {
		const q = ambienceQueryDebounced.trim().toLowerCase();
		const base = backgroundOptions.find((b) => b.id === "none");
		const rest = backgroundOptions.filter((b) => b.id !== "none" && (q === "" || b.label.toLowerCase().includes(q)));
		return base ? [base, ...rest] : rest;
	}, [backgroundOptions, ambienceQueryDebounced]);

	// Split filtered ambience into pages
	const backgroundPages = useMemo(() => {
		const pageSize = 6;
		const pages: (BackgroundOption | null)[][] = [];
		const optionsCount = filteredBackgroundOptions.length;
		const pageCount = Math.ceil(optionsCount / pageSize);
		for (let i = 0; i < pageCount; i++) {
			const start = i * pageSize;
			const end = start + pageSize;
			const page: (BackgroundOption | null)[] = filteredBackgroundOptions.slice(start, end);
			while (page.length < pageSize) page.push(null);
			pages.push(page);
		}
		if (pages.length === 0) pages.push(Array(9).fill(null));
		return pages;
	}, [filteredBackgroundOptions]);

	const filteredTopdownItems = useMemo(() => {
		const q = topdownQueryDebounced.trim().toLowerCase();
		if (q === "") return topdownItems;
		return topdownItems.filter((it) => it.label.toLowerCase().includes(q));
	}, [topdownItems, topdownQueryDebounced]);

	const topdownPages = useMemo(() => {
		const pageSize = 6;
		const pages: ({ id: string; label: string; thumbUrl: string } | null)[][] = [];
		const optionsCount = filteredTopdownItems.length;
		const pageCount = Math.ceil(optionsCount / pageSize);
		for (let i = 0; i < pageCount; i++) {
			const start = i * pageSize;
			const end = start + pageSize;
			const page: ({ id: string; label: string; thumbUrl: string } | null)[] = filteredTopdownItems.slice(start, end);
			while (page.length < pageSize) page.push(null);
			pages.push(page);
		}
		if (pages.length === 0) pages.push(Array(9).fill(null));
		return pages;
	}, [filteredTopdownItems]);

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
								maxFileSize={15 * 1024 * 1024}
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
								<Tabs defaultValue="ambience" className="w-full">
									<div className="mb-2 flex flex-wrap items-center justify-between gap-3">
										<TabsList>
											<TabsTrigger value="ambience">Ambience</TabsTrigger>
											<TabsTrigger value="topview">Top view</TabsTrigger>
											<TabsTrigger value="upload">Upload</TabsTrigger>
										</TabsList>
										<div className="flex items-center gap-2">
											<Checkbox id="preservePlate_bg" checked={preservePlate} onCheckedChange={(v) => setPreservePlate(Boolean(v))} />
											<label htmlFor="preservePlate_bg" className="text-sm">Keep original plate/vessel</label>
											<Tooltip>
												<TooltipTrigger asChild>
													<button aria-label="Plate info" className="inline-flex items-center justify-center size-5 rounded hover:bg-muted">
														<Info className="h-4 w-4 text-muted-foreground" />
													</button>
												</TooltipTrigger>
												<TooltipContent sideOffset={6}>
													If off, we may place your dish on a new plate suitable to the environment.
												</TooltipContent>
											</Tooltip>
										</div>
									</div>
									<TabsContent value="ambience">
										<div className="mb-3 relative">
											<Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<Input value={ambienceQuery} onChange={(e) => setAmbienceQuery(e.target.value)} placeholder="Search ambience backgrounds..." className="pl-8" />
										</div>
										<Carousel opts={{ align: "start", loop: false }} className="w-full">
											<div className="flex items-center justify-center gap-4">
												<CarouselPrevious className="static inset-auto translate-x-0 translate-y-0 shrink-0" />
												<div className="flex-1 overflow-hidden">
													<CarouselContent>
														{backgroundPages.map((page, pageIndex) => (
															<CarouselItem key={pageIndex} className="basis-full">
																<div className="p-1 grid grid-cols-3 gap-3">
																	{page.map((bg, itemIndex) =>
																		bg ? (
																			<button key={bg.id} onClick={() => { setSelectedBackground(bg.id); setSelectedTopdownRef(null); }} className="text-left">
																				<Card className={selectedBackground === bg.id ? "border-primary ring-1 ring-primary overflow-hidden" : "overflow-hidden"}>
																					<CardContent className="p-0">
																						<div className="aspect-square bg-muted/30 overflow-hidden flex items-center justify-center">
																							{bg.id === "none" ? (
																								<ImageIcon className="h-8 w-8 text-muted-foreground" />
																							) : (
																								<img src={bg.thumb} alt={bg.label} className="h-full w-full object-cover" />
																							)}
																					</div>
																					<div className="p-2 text-sm leading-5 h-14 overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{bg.label}</div>
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
									<TabsContent value="topview">
										<div className="mb-3 relative">
											<Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<Input value={topdownQuery} onChange={(e) => setTopdownQuery(e.target.value)} placeholder="Search top view backgrounds..." className="pl-8" />
										</div>
										<Carousel opts={{ align: "start", loop: false }} className="w-full">
											<div className="flex items-center justify-center gap-4">
												<CarouselPrevious className="static inset-auto translate-x-0 translate-y-0 shrink-0" />
												<div className="flex-1 overflow-hidden">
													<CarouselContent>
														{topdownPages.map((page, pageIndex) => (
															<CarouselItem key={pageIndex} className="basis-full">
																<div className="p-1 grid grid-cols-3 gap-3">
																	{page.map((it, itemIndex) =>
																		it ? (
																			<button key={it.id} onClick={() => { const ref = `v4-topdown:${it.id}`; setSelectedTopdownRef(ref); setSelectedBackground('none'); }} className="text-left">
																				<Card className={selectedTopdownRef === `v4-topdown:${it.id}` ? "border-primary ring-1 ring-primary overflow-hidden" : "overflow-hidden"}>
																					<CardContent className="p-0">
																						<div className="aspect-square bg-muted/30 overflow-hidden flex items-center justify-center">
																							<img src={it.thumbUrl} alt={it.label} className="h-full w-full object-cover" />
																						</div>
																						<div className="p-2 text-sm leading-5 h-14 overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{it.label}</div>
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
										<CarouselDots count={topdownPages.length} className="mt-4" />
									</Carousel>
									</TabsContent>
									<TabsContent value="upload">
										<div className="space-y-3">
											<FileUpload
												uploadDelay={0}
												acceptedFileTypes={["image/jpeg", "image/png", "image/webp"]}
												maxFileSize={15 * 1024 * 1024}
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
							<CardTitle>3) Style & Output</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="space-y-4">
								<Textarea value={styleHint} onChange={(e) => setStyleHint(e.target.value)} maxLength={250} placeholder="Describe details of the image scenery, style, etc." />
								<div className="space-y-2">
									<div className="text-sm font-medium">Lens Look</div>
									<Tabs value={lens} onValueChange={(v) => setLens(v as Lens)} className="w-full">
										<TabsList className="grid w-full grid-cols-3">
											{lensOptions.map((opt) => (
												<TabsTrigger key={opt} value={opt}>{opt}</TabsTrigger>
											))}
										</TabsList>
									</Tabs>
								</div>
								<div className="space-y-2">
									<div className="text-sm font-medium">Aspect Ratio</div>
									<Tabs value={aspectRatio} onValueChange={(v) => setAspectRatio(v as AspectRatioId)} className="w-full">
										<TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
											{aspectRatioOptions.map((opt) => {
												const Icon = opt.icon;
												return (
													<TabsTrigger key={opt.id} value={opt.id} className="flex items-center gap-2">
													<Icon className="h-4 w-4" />
													{opt.label}
												</TabsTrigger>
											);
										})}
										</TabsList>
									</Tabs>
								</div>
							</div>
						</CardContent>
					</Card>

					<Button className="w-full" size="lg" disabled={!canEnhance || isGenerating} onClick={async () => {
						if (!uploaded) return;
						try {
							setIsGenerating(true);
							setGeneratedImageUrl(null);
							const fd = new FormData();
							fd.append("dish", uploaded);
							if (backgroundUpload) {
								fd.append("background", backgroundUpload);
							} else if (selectedTopdownRef) {
								fd.append("bgRef", selectedTopdownRef);
							} else if (selectedBackground && selectedBackground !== "none") {
								const selected = backgroundOptions.find((b) => b.id === selectedBackground);
								if (selected?.preset) {
									fd.append("bgPreset", selected.preset);
									fd.append("bgRef", `v3-ambience:${selected.preset}`);
								}
							}
							fd.append("prompt", styleHint ?? "");
							fd.append("lensLook", lens);
							fd.append("aspectRatio", aspectRatio);
							fd.append("preservePlate", preservePlate ? "1" : "0");
							const debugSuffix = (() => {
								try {
									const p = new URLSearchParams(window.location.search);
									return p.get('debug') === '1' ? '?debug=1' : '';
								} catch { return ''; }
							})();
							const resp = await fetch(`/api/generate${debugSuffix}`, { method: "POST", body: fd });
							if (!resp.ok) {
								let details = "";
								try { details = await resp.text(); } catch {}
								throw new Error(`Generation failed: ${resp.status}${details ? ` - ${details}` : ""}`);
							}
							const blob = await resp.blob();
							const url = URL.createObjectURL(blob);
							setGeneratedImageUrl(url);
						} catch (e) {
							console.error(e);
						} finally {
							setIsGenerating(false);
						}
					}}>
						{isGenerating ? "Enhancing..." : "Enhance Photo"}
					</Button>
				</div>

				<div className="space-y-4">
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center justify-between">
								<span>Preview</span>
								<span className="text-xs font-normal text-muted-foreground flex items-center gap-2">Lens: {lens} · Ratio: {aspectRatio} {preservePlate ? (<Badge variant="secondary">Plate kept</Badge>) : (<Badge variant="outline">Plate may change</Badge>)}</span>
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
