import { useRequestContext } from "rakkasjs";
import { useMemo } from "react";
import { defaultSizes } from "./constants";
import { imageCache } from "./image-cache";
import { ImageProps } from "./image-types";
import { createSrcSet, isPxRequest } from "./image-utils";

export const Image = ({ src, width, height }: ImageProps) => {
  const srcSet = useMemo(() => {
    return createSrcSet(src, width);
  }, [src, width]);

  if (import.meta.env.SSR) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const ctx = useRequestContext()!;
    import("./optimized-image").then(({ OptimizedImage }) => {
      if (!imageCache.get(src)) {
        const img = new OptimizedImage(src);
        const px = isPxRequest(width);
        const allowedSizes = [...defaultSizes];
        if (px) {
          allowedSizes.push(px);
        }
        img.initialize(ctx.request, allowedSizes);
        imageCache.set(src, img);
      }
    });
  }

  return (
    <div
      style={{
        display: "flex",
        width: width,
        height: height,
      }}
    >
      <img
        srcSet={srcSet}
        width={"100%"}
        height={"100%"}
        alt=""
        style={{
          objectFit: "contain",
          maxHeight: "100%",
          maxWidth: "100%",
        }}
      />
    </div>
  );
};
