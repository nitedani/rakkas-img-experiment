export const defaultSizes = [600, 1000, 1400, 2000, 2560, 3840];
export const cacheSizeMb = 50;
export const webpQuality = 65;
export const avifQuality = 45;

export const getSizeForRequest = (width: number) => {
  const sizes = defaultSizes;
  for (const size of sizes) {
    if (width <= size) {
      return size;
    }
  }
  return sizes[sizes.length - 1];
};
