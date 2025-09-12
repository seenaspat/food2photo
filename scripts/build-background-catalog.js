#!/usr/bin/env node

const fs = require('fs');
const fsp = require('fs/promises');
const path = require('path');

function slugToTitle(slug) {
	return slug.split('-').map(p => p ? (p[0].toUpperCase() + p.slice(1)) : p).join(' ');
}

async function fileExists(p) {
	try { await fsp.access(p, fs.constants.F_OK); return true; } catch { return false; }
}

async function main() {
	const projectRoot = process.cwd();
	const v3Dir = path.join(projectRoot, 'public', 'backgrounds', 'v3-003');
	const v4Dir = path.join(projectRoot, 'public', 'backgrounds', 'v4-003');
	const varsv3Dir = path.join(projectRoot, 'templates', 'varsv3');
	const varsv4Dir = path.join(projectRoot, 'templates', 'varsv4');

	const v3Files = (await fsp.readdir(v3Dir)).filter(f => f.endsWith('.png'));
	const v4Files = (await fsp.readdir(v4Dir)).filter(f => f.endsWith('.png'));

	// Families
	const families = [
		{
			id: 'v3-ambience',
			label: 'Ambience Presets',
			integration: { type: 'template_vars', templatePath: 'templates/backgrounds-v3.md', varsDir: 'templates/varsv3' },
			styleProfile: 'ambience',
		},
		{
			id: 'v4-topdown',
			label: 'Top‑down Backgrounds',
			integration: { type: 'template_vars', templatePath: 'templates/backgrounds-v4.md', varsDir: 'templates/varsv4' },
			styleProfile: 'topdown',
		}
	];

	// Items from v3 images, map to vars when possible
	const v3Items = [];
	for (const file of v3Files) {
		const idNoExt = file.replace(/\.png$/i, '');
		const start = idNoExt.indexOf('bg-v3-') === 0 ? 6 : 0;
		const roleIdx = idNoExt.indexOf('-role-');
		const core = roleIdx > start ? idNoExt.substring(start, roleIdx) : idNoExt; // e.g., "bg-v3-diner-classic" or core
		const coreNoPrefix = core.replace(/^bg-v3-/, '');
		const label = slugToTitle(coreNoPrefix);
		const varsFileCandidate = `${coreNoPrefix}.json`;
		const hasVars = await fileExists(path.join(varsv3Dir, varsFileCandidate));
		v3Items.push({
			id: coreNoPrefix,
			label,
			familyId: 'v3-ambience',
			tags: [],
			thumbUrl: `/backgrounds/v3-003/${file}`,
			payload: { type: 'template_vars', varsFile: hasVars ? varsFileCandidate : varsFileCandidate },
		});
	}

	// Items from v4 images, map to varsv4 when possible (mirror v3 logic)
	const v4Items = [];
	for (const file of v4Files) {
		const idNoExt = file.replace(/\.png$/i, '');
		const start = idNoExt.indexOf('bg-v4-') === 0 ? 6 : 0;
		const roleIdx = idNoExt.indexOf('-role-');
		const core = roleIdx > start ? idNoExt.substring(start, roleIdx) : idNoExt; // e.g., "bg-v4-overhead-bright-marble"
		let coreNoPrefix = core.replace(/^bg-v4-/, '');
		// Alias mapping for legacy/mismatched filenames → vars slugs
		const aliasMap = {
			'tropical-translucency': 'tropical-fruit-board',
		};
		const aliased = aliasMap[coreNoPrefix];
		if (aliased) coreNoPrefix = aliased;
		const label = slugToTitle(coreNoPrefix);
		const varsFileCandidate = `${coreNoPrefix}.json`;
		const hasVars = await fileExists(path.join(varsv4Dir, varsFileCandidate));
		v4Items.push({
			id: coreNoPrefix,
			label,
			familyId: 'v4-topdown',
			tags: [],
			thumbUrl: `/backgrounds/v4-003/${file}`,
			payload: { type: 'template_vars', varsFile: hasVars ? varsFileCandidate : varsFileCandidate },
		});
	}

	const manifest = { families, items: [...v3Items, ...v4Items] };
	const outPath = path.join(projectRoot, 'public', 'backgrounds', 'manifest.json');
	await fsp.writeFile(outPath, JSON.stringify(manifest, null, 2), 'utf8');
	console.log(`Wrote manifest with ${manifest.items.length} items to ${path.relative(projectRoot, outPath)}`);
}

main().catch((err) => { console.error(err); process.exit(1); });
