import { readFile } from "node:fs/promises";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import LessonView from "@/components/LessonView";
import { COURSE } from "@/data/course";

export const dynamicParams = false;

export function generateStaticParams() {
  return COURSE.map((_, i) => ({ n: String(i + 1) }));
}

const lessonAt = (n: string) => {
  const i = Number(n) - 1;
  return Number.isInteger(i) && COURSE[i] ? i : -1;
};

export async function generateMetadata({ params }: PageProps<"/lessons/[n]">): Promise<Metadata> {
  const i = lessonAt((await params).n);
  if (i < 0) return {};
  const c = COURSE[i];
  return {
    title: c.title,
    description: `${c.group} · ${c.tag} — ${c.title}। বাংলায় বুঝে বুঝে ইংরেজি শেখার ৩ মাসের কোর্সের পাঠ ${i + 1}।`,
  };
}

export default async function Page({ params }: PageProps<"/lessons/[n]">) {
  const i = lessonAt((await params).n);
  if (i < 0) notFound();
  const html = await readFile(path.join(process.cwd(), "src/content/lessons", COURSE[i].id + ".html"), "utf8");
  return <LessonView key={i} index={i} html={html} />;
}
