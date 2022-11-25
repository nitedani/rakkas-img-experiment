import { defaultSizes } from "./constants";
import { SafeNumber } from "./image-types";

export const getSizeForRequest = (width: SafeNumber) => {
  const sizes = defaultSizes;
  for (const size of sizes) {
    if (width <= size) {
      return size;
    }
  }
  return sizes[sizes.length - 1];
};

const makeUrl = (id: string, size: SafeNumber, quality?: SafeNumber) => {
  let url = `/image?id=${id}&size=${size}`;
  if (quality) {
    url += `&quality=${quality}`;
  }
  url += ` ${size}w`;
  return url;
};

export const createSrcSet = (
  id: string,
  width?: SafeNumber,
  quality?: SafeNumber
) => {
  if (width) {
    return makeUrl(id, getSizeForRequest(width), quality);
  }
  const srcSet = defaultSizes.map((size) => makeUrl(id, size, quality));
  return srcSet.join(", ");
};

export const objectWithoutPropertiesLoose = <
  T extends { [key: string]: any },
  K extends Array<keyof T>
>(
  source: T,
  excluded: K
): Pick<T, Exclude<keyof T, K[number]>> => {
  if (source == null) return {} as any;
  const target: any = {};
  const sourceKeys = Object.keys(source);
  const key: keyof T = sourceKeys[0];
  const sourceKey = key;
  if (excluded.indexOf(sourceKey) >= 0) return target;
  target[sourceKey] = source[sourceKey];
  return target;
};

export const parseSafeNumber = (size?: SafeNumber) => {
  if (typeof size === "string") {
    return parseInt(size, 10);
  }
  return size;
};
