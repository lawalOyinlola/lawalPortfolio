import localFont from "next/font/local";

export const ppMori = localFont({
  src: [
    {
      path: "./fonts/PPMori-Extralight.otf",
      weight: "200",
      style: "normal",
    },
    {
      path: "./fonts/PPMori-ExtralightItalic.otf",
      weight: "200",
      style: "italic",
    },
    {
      path: "./fonts/PPMori-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/PPMori-Italic.otf",
      weight: "400",
      style: "italic",
    },
    {
      path: "./fonts/PPMori-Semibold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "./fonts/PPMori-SemiboldItalic.otf",
      weight: "600",
      style: "italic",
    },
    {
      path: "./fonts/PPMori-Black.otf",
      weight: "900",
      style: "normal",
    },
    {
      path: "./fonts/PPMori-BlackItalic.otf",
      weight: "900",
      style: "italic",
    },
  ],
  variable: "--font-pp-mori",
});
