import { Image } from "components/image";
import image from "./test.jpg";

export default function HomePage() {
  return (
    <div
      style={{
        height: "100vh",
      }}
    >
      <Image
        src={
          "https://images.hdqwalls.com/download/small-memory-8k-2a-7680x4320.jpg"
        }
        width={200}

      />
      <Image src={image} width="80%" />
      <Image
        src={
          "https://my4kwallpapers.com/wp-content/uploads/2021/06/Anime-Wallpaper.jpg"
        }
        width={"100%"}
        // height={"100%"}
      />
      <Image
        src={
          "https://r4.wallpaperflare.com/wallpaper/826/109/269/spiderman-into-the-spider-verse-2018-movies-movies-spiderman-wallpaper-233b732dbd798b153fc612f7381bd878.jpg"
        }
        width={"100%"}
        // height={"100%"}
      />
    </div>
  );
}
