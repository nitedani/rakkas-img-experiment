import { Image } from "components/image";
import image from "./test.jpg";

const urls = [
  { src: image, width: 200 },
  {
    src: "https://images.hdqwalls.com/download/small-memory-8k-2a-7680x4320.jpg",
    width: 200,
    height: 200,
  },
  {
    src: "https://r4.wallpaperflare.com/wallpaper/51/74/361/disney-8k-animation-moana-wallpaper-dfe5091b8fb2b7717090797f3bad92aa.jpg",
    width: "100%",
    height: 200,
  },
  {
    src: "https://r4.wallpaperflare.com/wallpaper/826/109/269/spiderman-into-the-spider-verse-2018-movies-movies-spiderman-wallpaper-233b732dbd798b153fc612f7381bd878.jpg",
    width: "100%",
  },
  {
    src: "https://i.pinimg.com/736x/ff/6b/13/ff6b13316842b4b84f237f605f0c3f33.jpg",
    width: "100%",
  },
];

export default function HomePage() {
  return (
    <div
      style={{
        overflow: "hidden",
        // minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: "gray",
      }}
    >
      <Image
        src={urls[0].src}
        height={200}
        width={200}
        alt=""
        style={{ backgroundColor: "#d0f6ff" }}
      />
      <Image
        src={urls[1].src}
        height={200}
        width={200}
        alt=""
        style={{ backgroundColor: "#d0f6ff", objectFit: "contain" }}
      />
      <div
        style={{
          position: "relative",
          height: "500px",
        }}
      >
        <Image
          src={urls[3].src}
          fill
          alt=""
          style={{ backgroundColor: "#fffdd8", objectFit: "contain" }}
        />
      </div>
      <Image
        src={urls[4].src}
        width="640"
        height="200"
        alt=""
        style={{ backgroundColor: "#ffdede", objectFit: "contain" }}
      />
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "500px",
        }}
      >
        <Image
          src={urls[2].src}
          fill
          alt=""
          style={{ backgroundColor: "#ffdede", objectFit: "contain" }}
        />
      </div>
    </div>
  );
}
