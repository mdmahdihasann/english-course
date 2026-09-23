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
    default: "ইংরেজি বলা শিখি — ৩ মাসের স্পোকেন ইংলিশ ও গ্রামার কোর্স",
    template: "%s — ইংরেজি বলা শিখি",
  },
  description: "বাংলায় বুঝে বুঝে ইংরেজি গ্রামার ও স্পোকেন ইংলিশ শেখার ৩ মাসের সহজ কোর্স। ৩৩টি পাঠ, দৈনিক কুইজ, উচ্চারণ ও কথা বলার অনুশীলন।",
  applicationName: "ইংরেজি বলা শিখি",
  appleWebApp: { capable: true, title: "ইংরেজি শিখি", statusBarStyle: "default" },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    siteName: "ইংরেজি বলা শিখি",
    title: "ইংরেজি বলা শিখি — ৩ মাসের স্পোকেন ইংলিশ কোর্স",
    description: "বাংলায় বুঝে বুঝে ইংরেজি গ্রামার ও স্পোকেন ইংলিশ শেখার ৩ মাসের সহজ কোর্স।",
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
const boot = `try{var d=document.documentElement,t=JSON.parse(localStorage.getItem('theme')||'null');if(t==='dark'||t==='light')d.dataset.theme=t;var s=JSON.parse(localStorage.getItem('settings')||'{}');if(s&&s.font)d.dataset.fs=s.font}catch(e){}`;

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
