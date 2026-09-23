import type { Metadata, Viewport } from "next";
import { Noto_Sans, Noto_Sans_Bengali } from "next/font/google";
import AppShell from "@/components/AppShell";
import "./globals.css";

const notoBn = Noto_Sans_Bengali({ subsets: ["bengali"], variable: "--f-notobn", display: "swap" });
const noto = Noto_Sans({ subsets: ["latin"], variable: "--f-noto", display: "swap" });

const site = process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: {
    default: "Speak English — 3-month Spoken English & Grammar Course",
    template: "%s — Speak English",
  },
  description: "A simple 3-month spoken English and grammar course for Bangla speakers — 33 lessons, daily quizzes, pronunciation and speaking practice. Available in English and বাংলা.",
  applicationName: "Speak English",
  appleWebApp: { capable: true, title: "Speak English", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    locale: "en_US",
    alternateLocale: ["bn_BD"],
    siteName: "Speak English",
    title: "Speak English — 3-month Spoken English Course",
    description: "Learn English grammar and spoken English step by step — in English or বাংলা.",
  },
  icons: { icon: "/icons/192", apple: "/icons/180" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#0b6e4f" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1520" },
  ],
};

// the whole site uses the book's typeface: Noto Sans Bengali (Bangla) + Noto Sans (English)

// runs before paint so theme / font size never flash
// English mode: keep the page covered until the translator's first pass (max 1.8s)
const boot = `try{var d=document.documentElement,l=JSON.parse(localStorage.getItem('lang')||'"en"');d.lang=l;if(l!=='bn'){d.classList.add('tr-wait');setTimeout(function(){d.classList.remove('tr-wait')},1800)}}catch(e){}try{var d=document.documentElement,t=JSON.parse(localStorage.getItem('theme')||'null');if(t==='dark'||t==='light')d.dataset.theme=t;var s=JSON.parse(localStorage.getItem('settings')||'{}');if(s&&s.font)d.dataset.fs=s.font}catch(e){}`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="bn" suppressHydrationWarning className={[notoBn.variable, noto.variable].join(" ")}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
