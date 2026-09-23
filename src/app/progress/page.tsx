import type { Metadata } from "next";
import ProgressView from "@/components/ProgressView";

export const metadata: Metadata = {
  title: "আমার অগ্রগতি",
  description: "লেভেল, XP, পড়ার ক্যালেন্ডার আর ব্যাজ — ইংরেজি বলা শিখি।",
};

export default function Page() {
  return <ProgressView />;
}
