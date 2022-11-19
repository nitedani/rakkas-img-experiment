import { CachedImage, OriginalImage } from "./image-types";

export const imageCache = new Map<string, CachedImage>();
export const originalCache = new Map<string, OriginalImage>();
