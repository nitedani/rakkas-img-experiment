import { useRequestContext } from "rakkasjs";
import { createSrcSet, getOptimalStartingWidth } from "./image-utils";
import { ImageProps } from "./image-types";
import { useMemo } from "react";

export const Image = ({ src, width, height }: ImageProps) => {
  if (typeof width === "string" && width.endsWith("px")) {
    width = Number(width.slice(0, -2));
  }
  const isPxRequest = typeof width === "number";
  const ctx = useRequestContext();
  const size = useMemo(() => {
    if (isPxRequest) {
      return width;
    } else {
      if (ctx) {
        return getOptimalStartingWidth(ctx.request.headers.get("user-agent"));
      } else {
        return getOptimalStartingWidth(window.navigator.userAgent);
      }
    }
  }, [isPxRequest, width, ctx]);

  const srcSet = useMemo(() => {
    return !isPxRequest ? createSrcSet(src) : undefined;
  }, [isPxRequest, src]);

  return (
    <div
      style={{
        display: "flex",

        width: width,
        height: height,
      }}
    >
      <img
        src={`/image?id=${src}&size=${size}`}
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
