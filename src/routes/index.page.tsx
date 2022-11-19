import { Image } from "components/image";
import image from "./test.jpg";

export default function HomePage() {
  return (
    <div
      style={{
        height: "100vh",
      }}
    >
      <Image src={image} width="80%" />
      <Image
        src={
          "https://images.hdqwalls.com/download/small-memory-8k-2a-7680x4320.jpg"
        }
        width={200}
        height={200}
      />
      <Image
        src={
          "https://my4kwallpapers.com/wp-content/uploads/2021/06/Anime-Wallpaper.jpg"
        }
        width={"100%"}
        // height={"100%"}
      />
    </div>
  );
}
