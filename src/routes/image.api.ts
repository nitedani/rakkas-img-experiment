import { imageCache } from "components/image-cache";
import { createSize, getOriginal } from "components/image-utils";
import sharp from "sharp";

const pending = new Map<string, Promise<Response>>();
export async function get(req: Request) {
  const searchParams = new URL(req.url).searchParams;
  const id = searchParams.get("id");
  const _size = searchParams.get("size");
  if (!id || !_size) {
    return new Response("Missing id", { status: 400 });
  }
  if (pending.has(`${id}_${_size}`)) {
    return pending.get(`${id}_${_size}`)!;
  }

  const promise = (async () => {
    const width = Number(_size);

    let cachedImage = imageCache.get(id);
    if (cachedImage) {
      const cachedSize = cachedImage.sizes.find(
        (s) => s.width === Number(width)
      );
      if (cachedSize) {
        return new Response(cachedSize.data, {
          headers: {
            "Content-Type": "image/jpeg",
            "Content-Length": cachedSize.data.length.toString(),
          },
        });
      } else {
        const original = await getOriginal(id, req);
        if (!original.allowedWidths.has(width)) {
          return new Response("Invalid size specified", { status: 404 });
        }
        const instance = sharp(original.data);
        const data = await createSize({
          instance,
          cachedImage,
          width: Number(width),
        });
        return new Response(data, {
          headers: {
            "Content-Type": "image/jpeg",
            "Content-Length": data.length.toString(),
          },
        });
      }
    } else {
      const original = await getOriginal(id, req);
      if (!original.allowedWidths.has(width)) {
        return new Response("Invalid size specified", { status: 404 });
      }

      const instance = sharp(original.data);
      const stats = await instance.metadata();
      const originalWidth = stats.width;

      cachedImage = {
        width: originalWidth ?? 0,
        sizes: [],
      };
      const data = await createSize({
        cachedImage,
        instance,
        width,
      });
      imageCache.set(id, cachedImage);
      return new Response(data, {
        headers: {
          "Content-Type": "image/jpeg",
          "Content-Length": data.length.toString(),
        },
      });
    }
  })();
  pending.set(`${id}_${_size}`, promise);
  const result = await promise;
  pending.delete(`${id}_${_size}`);
  return result;
}
