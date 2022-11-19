import { readFile } from "fs/promises";
import { join } from "path";
import { cwd } from "process";
import sharp from "sharp";

export const imageCache = new Map<string, OptimizedImage>();

export class SizeError extends Error {
  constructor() {
    super();
    this.name = "SizeError";
  }
}
export class OptimizedImage {
  id: string;
  quality = 70;

  // set in initialize
  originalData!: Buffer;
  originalSize!: number;
  sharpInstance!: sharp.Sharp;

  initializingPromise?: Promise<void>;

  allowedSizes: Set<number> = new Set();
  sizes: Map<number, Buffer> = new Map();

  constructor(id: string) {
    this.id = id;
  }

  async getSize(size: number) {
    if (this.sizes.has(size)) {
      return this.sizes.get(size)!;
    }
    if (!this.initializingPromise) {
      throw new Error("Image not initialized");
    }
    if (!this.allowedSizes.has(size)) {
      throw new SizeError();
    }

    await this.initializingPromise;
    const resized = this.sharpInstance.clone().webp({
      quality: this.quality,
    });

    if (size < this.originalSize) {
      const resizeWidth =
        size < 400 && this.originalSize >= size + 200 ? size + 200 : size;
      resized.resize(resizeWidth, undefined, { fit: "inside" });
    }

    const data = await resized.toBuffer();

    if (size < this.originalSize) {
      console.log(
        `generated size ${this.originalSize} -> ${size}, ${
          this.originalData.byteLength / 1024
        }kb -> ${data.byteLength / 1024}kb`
      );
    } else {
      console.log(
        `compressed original size ${this.originalSize}, ${
          this.originalData.byteLength / 1024
        }kb -> ${data.byteLength / 1024}kb`
      );
    }

    this.sizes.set(size, data);

    return data;
  }

  async initialize(request: Request) {
    if (this.initializingPromise) {
      return this.initializingPromise;
    }
    this.initializingPromise = (async () => {
      let buffer: Buffer;
      const isLocal = this.id.startsWith("/");
      if (isLocal) {
        buffer = await readFile(join(cwd(), this.id));
      } else {
        const res = await fetch(this.id, {
          headers: request.headers,
        });
        const blob = await res.blob();
        buffer = Buffer.from(await blob.arrayBuffer());
      }

      this.originalData = buffer;
      this.sharpInstance = sharp(buffer);
      this.originalSize = (await this.sharpInstance.metadata()).width ?? 0;
    })();
    return this.initializingPromise;
  }
}
