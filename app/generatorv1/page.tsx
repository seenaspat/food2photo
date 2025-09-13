import { loadCatalog } from "../../lib/backgrounds/catalog.server";
import GeneratorV1Client, { CatalogItemLite } from "./GeneratorV1Client";

export default async function GeneratorV1Page() {
	const catalog = await loadCatalog();
	const ambience: CatalogItemLite[] = catalog.items
		.filter(i => i.familyId === 'v3-ambience')
		.map(i => ({ id: i.id, label: i.label, thumbUrl: i.thumbUrl }));
	const topdown: CatalogItemLite[] = catalog.items
		.filter(i => i.familyId === 'v4-topdown')
		.map(i => ({ id: i.id, label: i.label, thumbUrl: i.thumbUrl }));
	return <GeneratorV1Client ambienceItems={ambience} topdownItems={topdown} />;
}
