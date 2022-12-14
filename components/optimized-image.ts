import { readFile } from "fs/promises";
import { join } from "path";
import { cwd } from "process";
import sharp from "sharp";
import { fileURLToPath } from "url";
import { avifQuality, defaultSizes, webpQuality } from "./constants";
export class SizeError extends Error {
  constructor() {
    super();
    this.name = "SizeError";
  }
}

export class OptimizedImage {
  id: string;

  // set in initialize
  originalData!: Buffer;
  originalSize!: number;
  sharpInstance!: sharp.Sharp;

  initializingPromise?: Promise<void>;

  allowedSizes = new Set(defaultSizes);
  sizesWebp: Map<number, Buffer> = new Map();
  sizesAvif: Map<number, Buffer> = new Map();
  lastAccess = Date.now();

  constructor(id: string) {
    this.id = id;
  }

  async getSize(size: number, format: "webp" | "avif") {
    switch (format) {
      case "avif":
        if (this.sizesAvif.has(size)) {
          return { data: this.sizesAvif.get(size)!, redirectTo: null };
        }
        break;
      case "webp":
        if (this.sizesWebp.has(size)) {
          return { data: this.sizesWebp.get(size)!, redirectTo: null };
        }
        break;
      default:
        throw new Error("Invalid format");
    }

    if (!this.initializingPromise) {
      throw new Error("Image not initialized");
    }

    await this.initializingPromise;

    if (!this.allowedSizes.has(size)) {
      throw new SizeError();
    }

    let newSize = size;
    if (newSize < 400) {
      newSize += 100;
    }

    if (newSize > this.originalSize) {
      return {
        redirectTo: this.originalSize,
        data: null,
      };
    }

    let img: sharp.Sharp;
    switch (format) {
      case "avif":
        img = this.sharpInstance.clone().avif({
          quality: avifQuality,
        });
        break;
      case "webp":
        img = this.sharpInstance.clone().webp({
          quality: webpQuality,
        });
        break;
      default:
        throw new Error("Invalid format");
    }

    if (newSize < this.originalSize) {
      img.resize(newSize, undefined, { fit: "inside" });
    }

    const data = await img.toBuffer();

    if (newSize < this.originalSize) {
      console.log(
        `generated size ${this.originalSize} -> ${newSize}, ${(
          this.originalData.byteLength / 1024
        ).toFixed()}kb -> ${(data.byteLength / 1024).toFixed()}kb`
      );
    } else {
      console.log(
        `compressed original size ${this.originalSize}, ${(
          this.originalData.byteLength / 1024
        ).toFixed()}kb -> ${(data.byteLength / 1024).toFixed()}kb`
      );
    }

    switch (format) {
      case "avif":
        this.sizesAvif.set(size, data);
        break;
      case "webp":
        this.sizesWebp.set(size, data);
        break;
      default:
        throw new Error("Invalid format");
    }

    return { data, redirectTo: null };
  }

  initialize(request: Request) {
    if (this.initializingPromise) {
      return this.initializingPromise;
    }
    this.initializingPromise = (async () => {
      let buffer: Buffer;
      const isLocal = this.id.startsWith("/");
      if (isLocal) {
        // this.id = `http://localhost:5173${this.id}`;

        if (import.meta.env.DEV) {
          buffer = await readFile(join(cwd(), this.id));
        } else {
          const __dirname = fileURLToPath(new URL(".", import.meta.url));
          buffer = await readFile(
            join(__dirname, "..", "..", "client", this.id)
          );
        }
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
      this.allowedSizes.add(this.originalSize);
    })();
    return this.initializingPromise;
  }

  getCacheSize() {
    let size = this.originalData?.length ?? 0;
    for (const buffer of this.sizesWebp.values()) {
      size += buffer.length;
    }
    for (const buffer of this.sizesAvif.values()) {
      size += buffer.length;
    }

    return size || 1;
  }
}
