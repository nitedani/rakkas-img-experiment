import { useSSQ } from "rakkasjs";
import { imageCache, OptimizedImage } from "./image-cache";
import { ImageProps } from "./image-types";

const defaultSizes = [600, 1000, 1400, 2000, 3840];
export const getOptimalStartingWidth = (userAgent: string | null) => {
  if (!userAgent) {
    return 1000;
  }
  const match = userAgent.match(/(iPhone|iPad|iPod|Android)/);
  if (match) {
    //if first request is from mobile, don't generate large images
    return 600;
  }
  return 1000;
};

export const useSrcSet = ({ src, width: reqWidth }: ImageProps) => {
  return useSSQ(
    async (ctx) => {
      if (typeof reqWidth === "string" && reqWidth.endsWith("px")) {
        reqWidth = Number(reqWidth.slice(0, -2));
      }
      const isPxRequest = typeof reqWidth === "number";

      // find out the optimal width for the current device

      let image = imageCache.get(src);
      if (!image) {
        image = new OptimizedImage(src);
        image.allowedSizes = new Set([
          isPxRequest
            ? Number(reqWidth)
            : getOptimalStartingWidth(ctx.request.headers.get("user-agent")),
        ]);
        imageCache.set(src, image);
      }
      await image.initialize(ctx.request);

      const originalWidth = image.originalSize;

      const requestableSizes = [];
      if (originalWidth) {
        if (!isPxRequest) {
          for (const width of defaultSizes) {
            if (originalWidth > width) {
              requestableSizes.push(width);
            }
          }

          // we only need a fixed size
        } else if (isPxRequest && originalWidth > reqWidth) {
          requestableSizes.push(Number(reqWidth));
        }
      }

      if (originalWidth && (!isPxRequest || reqWidth === originalWidth)) {
        requestableSizes.push(originalWidth);
      }
      requestableSizes.sort((a, b) => a - b);

      if (image.allowedSizes.size < 5) {
        for (const size of requestableSizes) {
          image.allowedSizes.add(size);
        }
      }

      return requestableSizes;
    },
    { staleTime: Infinity, key: src }
  );
};
