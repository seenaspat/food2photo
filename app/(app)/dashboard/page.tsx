import { loadCatalog } from "@/lib/backgrounds/catalog.server";
import ClientOnlyGenerator from "./ClientOnlyGenerator";
import type { CatalogItemLite } from "./GeneratorV1Client";

export default async function DashboardPage() {
  const catalog = await loadCatalog();
  const ambience: CatalogItemLite[] = catalog.items
    .filter((i) => i.familyId === "v3-ambience")
    .map((i) => ({ id: i.id, label: i.label, thumbUrl: i.thumbUrl }));
  const topdown: CatalogItemLite[] = catalog.items
    .filter((i) => i.familyId === "v4-topdown")
    .map((i) => ({ id: i.id, label: i.label, thumbUrl: i.thumbUrl }));
  return <ClientOnlyGenerator ambienceItems={ambience} topdownItems={topdown} />;
}
