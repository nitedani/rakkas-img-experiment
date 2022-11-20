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
  if (pending.has(`${id}_${_size}`)) {
    return pending.get(`${id}_${_size}`)!;
  }

  const promise = (async () => {
    const width = Number(_size);
    let image = imageCache.get(id);
    if (!image) {
      image = new OptimizedImage(id);
      imageCache.set(id, image);
      await image.initialize(ctx.request);
    }

    try {
      const format = ctx.request.headers.get("accept")?.includes("avif")
        ? "avif"
        : "webp";
      const { data, redirectTo } = await image.getSize(width, format);
      if (data) {
        return new Response(data, {
          headers: {
            "Content-Type": `image/${format}`,
            "Content-Length": data.length.toString(),
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
        return new Response("Size not allowed", { status: 400 });
      }
      return new Response("Bad request", { status: 400 });
    }
  })();
  pending.set(`${id}_${_size}`, promise);
  const result = await promise;
  pending.delete(`${id}_${_size}`);
  return result;
}
