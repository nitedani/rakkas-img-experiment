import { Image } from "components/image";
import { useEffect, useState } from "react";
import image from "./test.jpg";

const urls = [
  { src: image, width: 200 },
  {
    src: "https://images.hdqwalls.com/download/small-memory-8k-2a-7680x4320.jpg",
    width: 200,
  },
  {
    src: "https://r4.wallpaperflare.com/wallpaper/51/74/361/disney-8k-animation-moana-wallpaper-dfe5091b8fb2b7717090797f3bad92aa.jpg",
    width: 200,
  },
  {
    src: "https://r4.wallpaperflare.com/wallpaper/826/109/269/spiderman-into-the-spider-verse-2018-movies-movies-spiderman-wallpaper-233b732dbd798b153fc612f7381bd878.jpg",
    width: "100%",
  },
];
export default function HomePage() {
  const [counter, setCounter] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCounter((prev) => (prev + 1) % urls.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      style={{
        height: "100vh",
      }}
    >
      {urls.map((url, i) => {
        if (i === counter) {
          return <Image key={url.src} src={url.src} width={url.width} />;
        }
        return null;
      })}
    </div>
  );
}
