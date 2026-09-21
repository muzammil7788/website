import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { getSettings, s } from "@/lib/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: {
      default: `${s(settings, "siteName")}`,
      template: `%s | ${s(settings, "siteName")}`,
    },
    description: s(settings, "siteDescription"),
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();

  return (
    <html
      lang="en"
      data-theme={s(settings, "theme")}
      style={{ "--accent": s(settings, "accentColor") } as React.CSSProperties}
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="flex min-h-screen flex-col antialiased">
        <div className="flex flex-1 flex-col">{children}</div>
      </body>
    </html>
  );
}