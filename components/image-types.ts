export interface ImageProps {
  src: string;
  width: number | string;
  height?: number | string;
  quality?: number;
}
export interface CachedImage {
  width: number;
  sizes: {
    width: number;
    data: Buffer;
  }[];
}
export interface OriginalImage {
  metadata: {
    width: number;
  };
  data?: Buffer;
  allowedWidths: Set<number>;
}
