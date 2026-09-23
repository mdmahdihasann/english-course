import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ইংরেজি বলা শিখি — স্পোকেন ইংলিশ কোর্স",
    short_name: "ইংরেজি শিখি",
    description: "বাংলায় বুঝে বুঝে ইংরেজি গ্রামার ও স্পোকেন ইংলিশ শেখার ৩ মাসের সহজ কোর্স।",
    lang: "bn",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f3f5f2",
    theme_color: "#0b6e4f",
    icons: [
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
