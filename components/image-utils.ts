import { defaultSizes } from "./constants";

export const getOptimalStartingWidth = (userAgent: string | null) => {
  if (!userAgent) {
    return defaultSizes[1];
  }
  const match = userAgent.match(/(iPhone|iPad|iPod|Android)/);
  if (match) {
    //if first request is from mobile, don't generate large images
    return defaultSizes[0];
  }
  return defaultSizes[1];
};
export const createSrcSet = (id: string, width: string | number) => {
  if (typeof width === "string" && width.endsWith("px")) {
    width = Number(width.slice(0, -2));
  }
  const isPxRequest = typeof width === "number";
  if (isPxRequest) {
    return `/image?id=${id}&size=${width} ${width}w`;
  }
  const srcSet = defaultSizes.map((size) => {
    return `/image?id=${id}&size=${size} ${size}w`;
  });
  return srcSet.join(", ");
};
