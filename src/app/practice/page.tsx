import type { Metadata } from "next";
import Practice from "@/components/Practice";

export const metadata: Metadata = {
  title: "দৈনিক অনুশীলন",
  description: "প্রতিদিন নতুন কুইজ, বাক্য, শব্দ, কথা বলার অনুশীলন, হোম টাস্ক আর লেখার টপিক — ইংরেজি বলা শিখি।",
};

export default function Page() {
  return <Practice />;
}
