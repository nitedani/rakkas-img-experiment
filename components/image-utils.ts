import { originalCache } from "components/image-cache";
import { readFile } from "fs/promises";
import { join } from "path";
import { cwd } from "process";
import sharp from "sharp";
import { CachedImage, OriginalImage } from "./image-types";

const pending = new Map<string, Promise<OriginalImage>>();

export const getOriginal = async (
  id: string,
  request: Request,
  initialSize?: number
) => {
  const cachedImage = originalCache.get(id);
  if (cachedImage && cachedImage.data && cachedImage.metadata) {
    return cachedImage;
  }
  if (pending.has(id)) {
    return pending.get(id)!;
  }

  const promise = (async () => {
    let buffer: Buffer;
    const isLocal = id.startsWith("/");
    if (isLocal) {
      buffer = await readFile(join(cwd(), id));
    } else {
      const res = await fetch(id, {
        headers: request.headers,
      });
      const blob = await res.blob();
      buffer = Buffer.from(await blob.arrayBuffer());
    }

    const newEntry: OriginalImage = {
      data: buffer,
      allowedWidths: new Set([initialSize ?? 600]),
      metadata: await sharp(buffer)
        .metadata()
        .then((metadata) => ({
          width: metadata.width ?? 0,
        })),
    };

    originalCache.set(id, newEntry);
    return newEntry;
  })();

  pending.set(id, promise);
  const result = await promise;
  pending.delete(id);
  return result;
};

export const createSize = async ({
  width,
  cachedImage,
  instance,
  quality = 80,
}: {
  width: number;
  cachedImage: CachedImage;
  instance: sharp.Sharp;
  quality?: number;
}) => {
  const cachedSize = cachedImage.sizes.find((s) => s.width === width);
  if (cachedSize) {
    return cachedSize.data;
  }

  const resizeWidth =
    width < 400 && cachedImage.width >= width + 200 ? width + 200 : width;

  const resized = instance
    .clone()
    .resize(resizeWidth, undefined, { fit: "inside" })
    .webp({
      quality,
    });

  const data = await resized.toBuffer();

  cachedImage.sizes.push({
    width,
    data,
  });

  return data;
};
