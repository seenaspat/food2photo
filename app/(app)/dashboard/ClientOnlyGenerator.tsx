"use client";

import { useEffect, useState } from "react";
import type { CatalogItemLite } from "./GeneratorV1Client";
import GeneratorV1Client from "./GeneratorV1Client";

export default function ClientOnlyGenerator({ ambienceItems, topdownItems }: { ambienceItems: CatalogItemLite[]; topdownItems: CatalogItemLite[] }) {
	const [mounted, setMounted] = useState(false);
	useEffect(() => { setMounted(true); }, []);
	if (!mounted) return null;
	return <GeneratorV1Client ambienceItems={ambienceItems} topdownItems={topdownItems} />;
}


