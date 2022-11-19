import { imageCache } from "components/image-cache";
import { OptimizedImage, SizeError } from "components/optimized-image";

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
    let image = imageCache.get(id);
    if (!image) {
      image = new OptimizedImage(id);
      await image.initialize(req);
      imageCache.set(id, image);
    }
    try {
      const cachedSize = await image.getSize(width);
      return new Response(cachedSize, {
        headers: {
          "Content-Type": "image/webp",
          "Content-Length": cachedSize.length.toString(),
        },
      });
    } catch (error: any) {
      if (error instanceof SizeError) {
        return new Response("Size not allowd", { status: 400 });
      }
      return new Response("Bad request", { status: 400 });
    }
  })();
  pending.set(`${id}_${_size}`, promise);
  const result = await promise;
  pending.delete(`${id}_${_size}`);
  return result;
}
