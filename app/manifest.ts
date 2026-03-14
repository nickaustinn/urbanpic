import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "UrbanPic",
    short_name: "UrbanPic",
    description: "AI-powered 311 civic issue reporter. Snap a photo, let AI handle the rest.",
    start_url: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#ffffff",
    theme_color: "#0284c7",
    categories: ["utilities", "productivity"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
    shortcuts: [
      {
        name: "Report an Issue",
        url: "/report",
        description: "Snap a photo and submit a civic report",
      },
      {
        name: "View Map",
        url: "/map",
        description: "See community reports on the map",
      },
    ],
  };
}
