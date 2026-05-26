import type { MetadataRoute } from "next";
import { BRAND } from "./constants";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${BRAND.name} | ${BRAND.title}`,
    short_name: BRAND.shortName,
    description: BRAND.description,
    start_url: "/",
    display: "standalone",
    background_color: "#000000",
    theme_color: "#000000",
    icons: [
      {
        src: "/icons/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/icons/favicon-32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/icons/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/icons/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
