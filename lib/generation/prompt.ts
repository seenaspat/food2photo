import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { ResolvedBackground } from '../backgrounds/types';

async function readTextFileSafe(absPath: string): Promise<string> {
	try { return await readFile(absPath, 'utf8'); } catch { return ''; }
}

export async function buildEnvSpec(resolved: ResolvedBackground): Promise<string> {
	if ('templateAbsPath' in resolved) {
		const tpl = await readTextFileSafe(resolved.templateAbsPath);
		const varsJson = await readTextFileSafe(resolved.varsAbsPath);
		return [
			'BACKGROUND_SPEC:',
			`Template ${path.basename(resolved.templateAbsPath)}`,
			'---',
			tpl,
			'---',
			'Vars:',
			varsJson,
		].join('\n');
	}
	return '';
}

export interface BuildPromptInput {
	resolved: ResolvedBackground | null;
	bgLine: string;
	dishSpecSnippet: string;
	lensMap: { focalDesc: string; dof: string; subjectOcc: string; fovHint: string; cropRule: string };
	aspectRatio: string;
	platePolicy: string;
	userPrompt: string;
}

export async function buildCompositionPrompt(input: BuildPromptInput): Promise<string> {
	const styleProfile = input.resolved ? input.resolved.family.styleProfile : undefined;
	const templateFile = styleProfile === 'topdown' ? 'compose-topdown-v1.md' : 'compose-v1.md';
	const genPath = path.join(process.cwd(), 'templates', 'generation', templateFile);
	let genTemplate = await readTextFileSafe(genPath);
	let envSpecBlock = '';
	if (input.resolved) {
		envSpecBlock = await buildEnvSpec(input.resolved);
	}
	const filled = (genTemplate || '')
		.replaceAll('{{BG_INPUT_LINE}}', input.bgLine)
		.replaceAll('{{DISH_SPEC_JSON}}', input.dishSpecSnippet || '{}')
		.replaceAll('{{FOCAL_DESC}}', input.lensMap.focalDesc)
		.replaceAll('{{DOF_HINT}}', input.lensMap.dof)
		.replaceAll('{{SUBJECT_OCC}}', input.lensMap.subjectOcc)
		.replaceAll('{{FOV_HINT}}', input.lensMap.fovHint)
		.replaceAll('{{CROP_RULE}}', input.lensMap.cropRule)
		.replaceAll('{{ASPECT_RATIO}}', input.aspectRatio || 'original')
		.replaceAll('{{PLATE_POLICY}}', input.platePolicy)
		.replaceAll('{{ENV_SPEC_BLOCK}}', envSpecBlock);
	return filled;
}

export async function loadImageBIfNeeded(resolved: ResolvedBackground | null): Promise<string | null> {
	if (!resolved) return null;
	if ('imagePublicPath' in resolved) {
		return resolved.imagePublicPath;
	}
	return null;
}
