import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type SiteSettings = Record<string, string>;

export const DEFAULT_SETTINGS: SiteSettings = {
  siteName: "My Website",
  tagline: "Welcome to my website",
  siteDescription: "A customizable website.",
  theme: "light",
  accentColor: "#4f46e5",
  footerText: "",
  logoUrl: "",
  postsPerPage: "9",
};

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const rows = await prisma.setting.findMany();
  const settings: SiteSettings = { ...DEFAULT_SETTINGS };
  for (const row of rows) {
    settings[row.key] = row.value;
  }
  return settings;
});

export async function saveSettings(values: SiteSettings) {
  const entries = Object.entries(values);
  for (const [key, value] of entries) {
    await prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  }
}

export const s = (settings: SiteSettings | undefined, key: string) =>
  settings?.[key] ?? DEFAULT_SETTINGS[key] ?? "";