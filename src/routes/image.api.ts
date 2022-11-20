import { imageCache } from "components/image-cache";
import { OptimizedImage, SizeError } from "components/optimized-image";
import { RequestContext } from "rakkasjs";

const pending = new Map<string, Promise<Response>>();
export async function get(ctx: RequestContext) {
  const searchParams = ctx.url.searchParams;
  const id = searchParams.get("id");
  const _size = searchParams.get("size");
  if (!id || !_size) {
    return new Response("Missing id", { status: 400 });
  }

  const format = ctx.request.headers.get("accept")?.includes("avif")
    ? "avif"
    : "webp";
  const key = `${id}-${_size}-${format}`;
  const _pending = pending.get(key);
  if (_pending) {
    return (await _pending).clone();
  }

  const promise = (async () => {
    let image = imageCache.get(id);
    if (!image) {
      image = new OptimizedImage(id);
      imageCache.set(id, image);
      await image.initialize(ctx.request);
    }

    try {
      const { data, redirectTo } = await image.getSize(Number(_size), format);
      if (data) {
        return new Response(data, {
          headers: {
            "Content-Type": `image/${format}`,
            "Content-Length": data.length.toString(),
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
      return new Response("Found", {
        headers: {
          Location: "/image?id=" + id + "&size=" + redirectTo,
        },
        status: 302,
      });
    } catch (error: any) {
      if (error instanceof SizeError) {
        return new Response("Size not allowed", { status: 200 });
      }
      console.error(error);
      return new Response("Bad request", { status: 400 });
    }
  })();
  pending.set(key, promise);
  const result = await promise;
  pending.delete(key);
  return result;
}
