import { useMemo } from "react";
import { ImageProps } from "./image-types";
import { createSrcSet } from "./image-utils";

export const Image = ({ src, width, height }: ImageProps) => {
  const srcSet = useMemo(() => {
    return createSrcSet(src, width);
  }, [src, width]);

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
