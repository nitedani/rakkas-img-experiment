import { useRequestContext } from "rakkasjs";
import { createSrcSet, getOptimalStartingWidth } from "./image-utils";
import { ImageProps } from "./image-types";

export const Image = ({ src, width, height }: ImageProps) => {
  if (typeof width === "string" && width.endsWith("px")) {
    width = Number(width.slice(0, -2));
  }
  const isPxRequest = typeof width === "number";
  const ctx = useRequestContext();
  const size = isPxRequest
    ? width
    : getOptimalStartingWidth(
        ctx?.request.headers.get("user-agent") || window.navigator.userAgent
      );

  const srcSet = !isPxRequest ? createSrcSet(src) : undefined;
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
