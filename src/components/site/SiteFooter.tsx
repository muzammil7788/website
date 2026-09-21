import Link from "next/link";
import { getSettings, s } from "@/lib/settings";
import { getMenus } from "@/lib/site";

export async function SiteFooter() {
  const [settings, menus] = await Promise.all([getSettings(), getMenus()]);

  return (
    <footer className="mt-16 border-t" style={{ borderColor: "var(--border)" }}>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {menus.footer.length > 0 && (
          <nav className="mb-6 flex flex-wrap gap-6 text-sm" aria-label="Footer">
            {menus.footer.map((item) => (
              <Link key={item.id} href={item.href} className="font-medium transition-opacity hover:opacity-70">
                {item.label}
              </Link>
            ))}
          </nav>
        )}
        <p className="text-sm" style={{ color: "var(--muted)" }}>
          {s(settings, "footerText") || `© ${new Date().getFullYear()} ${s(settings, "siteName")}. All rights reserved.`}
        </p>
      </div>
    </footer>
  );
}