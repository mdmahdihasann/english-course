import type { Metadata } from "next";
import Advanced from "@/components/adv/Advanced";

export const metadata: Metadata = {
  title: "অ্যাডভান্সড স্টুডিও",
  description: "রাইটিং পলিশার, Idioms ও Phrasal Verbs, গ্রামার ভুল খোঁজো, Collocations আর ফরমাল ইংলিশ — অ্যাডভান্সড ইংরেজি শিখি।",
};

export default function Page() {
  return <Advanced />;
}
