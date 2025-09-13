import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { BackgroundCatalog, BgRef, ResolvedBackground, isImageBIntegration, isTemplateVarsIntegration, BackgroundFamily, BackgroundItem } from './types';

function toAbsolutePath(projectRelativeOrAbsolute: string): string {
	return path.isAbsolute(projectRelativeOrAbsolute)
		? projectRelativeOrAbsolute
		: path.join(process.cwd(), projectRelativeOrAbsolute.replace(/^\/+/, ''));
}

export async function loadCatalog(): Promise<BackgroundCatalog> {
	const manifestPath = toAbsolutePath('public/backgrounds/manifest.json');
	const raw = await readFile(manifestPath, 'utf8');
	const json = JSON.parse(raw) as BackgroundCatalog;
	return json;
}

export function resolveByRef(catalog: BackgroundCatalog, bgRef: BgRef): { family: BackgroundFamily; item: BackgroundItem } {
	const colonIdx = bgRef.indexOf(':');
	if (colonIdx <= 0) throw new Error('Invalid bgRef');
	const familyId = bgRef.slice(0, colonIdx);
	const itemId = bgRef.slice(colonIdx + 1);
	const family = catalog.families.find(f => f.id === familyId);
	if (!family) throw new Error(`Unknown background family: ${familyId}`);
	const item = catalog.items.find(i => i.familyId === familyId && i.id === itemId);
	if (!item) throw new Error(`Unknown background item: ${bgRef}`);
	return { family, item };
}

export function resolveBackground(catalog: BackgroundCatalog, bgRef: BgRef): ResolvedBackground {
	const { family, item } = resolveByRef(catalog, bgRef);
	if (isTemplateVarsIntegration(family.integration) && item.payload.type === 'template_vars') {
		const templateAbsPath = toAbsolutePath(family.integration.templatePath);
		const varsAbsPath = toAbsolutePath(path.join(family.integration.varsDir, item.payload.varsFile));
		return {
			family: family as any,
			item: item as any,
			templateAbsPath,
			varsAbsPath,
		};
	}
	if (isImageBIntegration(family.integration) && item.payload.type === 'image_b') {
		return {
			family: family as any,
			item: item as any,
			imagePublicPath: item.payload.imagePath,
		};
	}
	throw new Error(`Family/item integration mismatch for ${bgRef}`);
}
