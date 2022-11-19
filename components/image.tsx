import { useRequestContext } from "rakkasjs";
import { Suspense, useEffect, useId } from "react";
import { getOptimalWidth, useSrcSet as useSrcSet } from "./image-hook";
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
  const ctx = useRequestContext();
  const size = isPxRequest
    ? width
    : getOptimalWidth(
        ctx?.request.headers.get("user-agent") || window.navigator.userAgent
      )[0];

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
  // console.log(`available sizes for ${src}, `, sizes);

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
