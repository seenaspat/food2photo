"use client";

import { useMemo } from "react";
import type { BackgroundFamily, BackgroundItem } from "../lib/backgrounds/types";
import { Card, CardContent } from "./ui/card";

export interface BackgroundPickerProps {
	families: ReadonlyArray<BackgroundFamily>;
	items: ReadonlyArray<BackgroundItem>;
	selectedBgRef: string | null;
	onSelect: (bgRef: string | null) => void;
}

export default function BackgroundPicker(props: BackgroundPickerProps) {
	const itemsByFamily = useMemo(() => {
		const map: Record<string, BackgroundItem[]> = {};
		for (const f of props.families) map[f.id] = [];
		for (const it of props.items) {
			(map[it.familyId] ||= []).push(it);
		}
		return map;
	}, [props.families, props.items]);

	return (
		<div className="space-y-4">
			<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
				<button onClick={() => props.onSelect(null)} className="text-left">
					<Card className={!props.selectedBgRef ? "border-primary ring-1 ring-primary" : ""}>
						<CardContent className="p-0">
							<div className="aspect-square bg-muted/30 flex items-center justify-center">
								<span className="text-sm text-muted-foreground">None</span>
							</div>
							<div className="p-2 text-sm">No background</div>
						</CardContent>
					</Card>
				</button>
			</div>

			{props.families.map((fam) => (
				<div key={fam.id} className="space-y-2">
					<div className="text-sm font-medium">{fam.label}</div>
					<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
						{(itemsByFamily[fam.id] || []).map((it) => {
							const bgRef = `${fam.id}:${it.id}`;
							const selected = props.selectedBgRef === bgRef;
							return (
								<button key={bgRef} onClick={() => props.onSelect(bgRef)} className="text-left">
									<Card className={selected ? "border-primary ring-1 ring-primary" : ""}>
										<CardContent className="p-0">
											<div className="aspect-square overflow-hidden bg-muted/30">
												<img src={it.thumbUrl} alt={it.label} className="h-full w-full object-cover" />
											</div>
											<div className="p-2 text-sm leading-5 h-10 overflow-hidden" style={{ display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{it.label}</div>
										</CardContent>
									</Card>
								</button>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
}
