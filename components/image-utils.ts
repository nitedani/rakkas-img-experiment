import { defaultSizes } from "./constants";

export const isPxRequest = (width: string | number) => {
  let px = width;
  if (typeof px === "string" && px.endsWith("px")) {
    px = Number(px.slice(0, -2));
    return px;
  }
  if (typeof px === "number") {
    return px;
  }
  return null;
};
export const getSizeForRequest = (width: number) => {
  const sizes = defaultSizes;
  for (const size of sizes) {
    if (width <= size) {
      return size;
    }
  }
  return sizes[sizes.length - 1];
};

export const createSrcSet = (id: string, width: string | number) => {
  const px = isPxRequest(width);
  if (px) {
    width = getSizeForRequest(px);
    return `/image?id=${id}&size=${width} ${width}w`;
  }
  const srcSet = defaultSizes.map((size) => {
    return `/image?id=${id}&size=${size} ${size}w`;
  });
  return srcSet.join(", ");
};
