import type { Metadata } from "next";
import Talk from "@/components/talk/Talk";

export const metadata: Metadata = {
  title: "রোল-প্লে স্টুডিও",
  description: "বাস্তব জীবনের ইংরেজি কথোপকথন — শোনো, তারপর নিজেই চরিত্রে ঢুকে বলো। পরিচয়, কেনাকাটা, রাস্তা জিজ্ঞেস, রেস্টুরেন্ট, ডাক্তার আর চাকরির ইন্টারভিউ।",
};

export default function Page() {
  return <Talk />;
}
