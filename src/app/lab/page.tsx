import type { Metadata } from "next";
import Lab from "@/components/lab/Lab";

export const metadata: Metadata = {
  title: "লার্নিং ল্যাব",
  description: "স্মার্ট রিভিশন (Spaced Repetition), বাক্য সাজাও, শুনে লেখো, Verb স্পিড ড্রিল আর পকেট অভিধান — ইংরেজি বলা শিখি।",
};

export default function Page() {
  return <Lab />;
}
