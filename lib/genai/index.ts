/**
 * GenAI Module Index
 *
 * Re-exports all public APIs from the genai module.
 */
export {
    createGenAIClient,
    generateImage,
    generateText,
    type AspectRatio, type GeneratedImage, type ImageGenerationOptions,
    type ImageGenerationResult
} from "./client";

export {
    ASPECT_RATIO_DIMENSIONS, analyzeDish,
    generateFoodImage, normalizeAspectRatio, prepareImageForApi, type AnalyzeDishOptions,
    type DishAnalysisResult,
    type GenerateFoodImageOptions,
    type GenerateFoodImageResult
} from "./image-generation";

