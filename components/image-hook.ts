import { useSSQ } from "rakkasjs";
import { ImageProps } from "./image-types";
import { getOriginal } from "./image-utils";

const largeScreenSizes = [1000, 1400, 2000];
export const getOptimalWidth = (userAgent: string | null) => {
  if (!userAgent) {
    return largeScreenSizes;
  }
  const match = userAgent.match(/(iPhone|iPad|iPod|Android)/);
  if (match) {
    //if first request is from mobile, don't generate large images
    return [600, 1000];
  }
  return largeScreenSizes;
};

export const useSrcSet = ({ src, width: reqWidth }: ImageProps) => {
  return useSSQ(
    async (ctx) => {
      let optimalWidths: number[] = largeScreenSizes;

      if (typeof reqWidth === "string" && reqWidth.endsWith("px")) {
        reqWidth = Number(reqWidth.slice(0, -2));
      }
      const isPxRequest = typeof reqWidth === "number";

      // find out the optimal width for the current device
      if (!isPxRequest) {
        const userAgent = ctx.request.headers.get("user-agent");
        optimalWidths = getOptimalWidth(userAgent);
      }
      const original = await getOriginal(
        src,
        ctx.request,
        isPxRequest ? Number(reqWidth) : optimalWidths[0]
      );
      const stats = original.metadata;
      const originalWidth = stats.width;

      const requestableSizes = [];
      if (originalWidth) {
        if (!isPxRequest) {
          for (const width of optimalWidths) {
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

      if (original.allowedWidths.size < 5) {
        for (const size of requestableSizes) {
          original.allowedWidths.add(size);
        }
      }

      return requestableSizes;
    },
    { staleTime: Infinity, key: src }
  );
};
