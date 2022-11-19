import { Suspense, useEffect, useId } from "react";
import { useOptimizedImage as useSrcSet } from "./image-hook";
import { ImageProps } from "./image-types";

const ImageBase = ({
  src,
  width,
  height,
  srcSet,
  id,
}: ImageProps & { srcSet?: string; id: string }) => {
  if (typeof width === "string" && width.endsWith("px")) {
    width = Number(width.slice(0, -2));
  }
  const isPxRequest = typeof width === "number";
  const size = isPxRequest ? width : 600;

  return (
    <div
      style={{
        display: "flex",

        width: width,
        height: height,
      }}
    >
      <img
        id={id}
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

export const Image = (props: ImageProps) => {
  const id = `image$$@_${useId()}`;
  const el = <ImageBase {...props} id={id} />;

  return (
    <Suspense fallback={el}>
      <SuspendedImage {...props} base={el} id={id} />
    </Suspense>
  );
};

export const SuspendedImage = ({
  src,
  width,
  height,
  base,
  id,
}: ImageProps & { base: JSX.Element; id: string }) => {
  const optimizedImage = useSrcSet({
    src,
    width,
    height,
  });

  const sizes = optimizedImage.data;

  const srcSet = sizes.reduce(
    (acc, width) => acc + `/image?id=${src}&size=${width} ${width}w,`,
    ""
  );

  useEffect(() => {
    const img = document.getElementById(id) as HTMLImageElement;

    if (img) {
      img.srcset = srcSet;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return base;
};
