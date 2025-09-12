export type BackgroundFamilyId = 'v3-ambience' | 'v4-topdown' | (string & {});

export interface TemplateVarsIntegration {
	readonly type: 'template_vars';
	readonly templatePath: string; // absolute or project-relative path to template md
	readonly varsDir: string; // directory containing *.json vars files
}

export interface ImageBIntegration {
	readonly type: 'image_b';
	readonly requiresImageB: true;
	readonly imageBasePath?: string; // optional public base path for assets (e.g., '/backgrounds/v4-003')
}

export type BackgroundIntegration = TemplateVarsIntegration | ImageBIntegration;

export interface BackgroundFamily {
	readonly id: BackgroundFamilyId;
	readonly label: string;
	readonly integration: BackgroundIntegration;
	readonly styleProfile: 'ambience' | 'topdown' | (string & {});
	readonly imageBasePath?: string;
}

export interface BackgroundItemTemplateVarsPayload {
	readonly type: 'template_vars';
	readonly varsFile: string; // filename within varsDir (e.g., 'ramen-shop.json')
}

export interface BackgroundItemImageBPayload {
	readonly type: 'image_b';
	readonly imagePath: string; // public path under /public, starts with '/'
}

export type BackgroundItemPayload = BackgroundItemTemplateVarsPayload | BackgroundItemImageBPayload;

export interface BackgroundItem {
	readonly id: string; // unique within family
	readonly label: string;
	readonly familyId: BackgroundFamilyId;
	readonly tags?: readonly string[];
	readonly thumbUrl: string; // public URL path for thumbnail (can be same as imagePath)
	readonly payload: BackgroundItemPayload;
}

export interface BackgroundCatalog {
	readonly families: readonly BackgroundFamily[];
	readonly items: readonly BackgroundItem[];
}

export interface ResolvedTemplateVarsBackground {
	readonly family: BackgroundFamily & { integration: TemplateVarsIntegration };
	readonly item: BackgroundItem & { payload: BackgroundItemTemplateVarsPayload };
	readonly templateAbsPath: string; // absolute path
	readonly varsAbsPath: string; // absolute path
}

export interface ResolvedImageBBackground {
	readonly family: BackgroundFamily & { integration: ImageBIntegration };
	readonly item: BackgroundItem & { payload: BackgroundItemImageBPayload };
	readonly imagePublicPath: string; // '/backgrounds/v4-003/..'
}

export type ResolvedBackground = ResolvedTemplateVarsBackground | ResolvedImageBBackground;

export type BgRef = `${BackgroundFamilyId}:${string}`;

export function isTemplateVarsIntegration(i: BackgroundIntegration): i is TemplateVarsIntegration {
	return i.type === 'template_vars';
}

export function isImageBIntegration(i: BackgroundIntegration): i is ImageBIntegration {
	return i.type === 'image_b';
}
