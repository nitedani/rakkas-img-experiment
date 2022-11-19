import { cacheSizeMb } from "./constants";
import { OptimizedImage } from "./optimized-image";

class ImageCache {
  maxSize = cacheSizeMb * 1024 * 1024;
  cache: Map<string, OptimizedImage> = new Map();

  get(key: string) {
    const val = this.cache.get(key);
    if (val) {
      val.lastAccess = Date.now();
      val.lock();
    }
    return val;
  }
  set(key: string, value: OptimizedImage) {
    value.lock();
    this.cache.set(key, value);
    this.sweep();
  }
  sweep() {
    let size = 0;
    for (const image of this.cache.values()) {
      size += image.getCacheSize();
    }
    if (size > this.maxSize) {
      const sorted = [...this.cache.entries()]
        .sort(([, a], [, b]) => b.lastAccess - a.lastAccess)
        .filter(([, image]) => !image.locked);
      for (const [key, image] of sorted) {
        if (size <= this.maxSize) {
          break;
        }
        size -= image.getCacheSize();
        this.cache.delete(key);
      }
    }
  }
}

export const imageCache = new ImageCache();
