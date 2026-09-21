import Link from "next/link";
import Image from "next/image";
import { getSettings, s } from "@/lib/settings";
import { getMenus } from "@/lib/site";

export async function SiteHeader() {
  const [settings, menus] = await Promise.all([getSettings(), getMenus()]);

  return (
    <header className="sticky top-0 z-40 border-b" style={{ background: "var(--bg)", borderColor: "var(--border)" }}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-3">
          {s(settings, "logoUrl") ? (
            <Image src={s(settings, "logoUrl")} alt="Logo" width={32} height={32} className="rounded" />
          ) : (
            <span
              className="flex h-8 w-8 items-center justify-center rounded font-bold text-white"
              style={{ background: "var(--accent)" }}
            >
              {s(settings, "siteName").charAt(0).toUpperCase()}
            </span>
          )}
          <span className="text-lg font-semibold">{s(settings, "siteName")}</span>
        </Link>

        {menus.primary.length > 0 && (
          <nav className="hidden items-center gap-6 text-sm md:flex" aria-label="Primary">
            {menus.primary.map((item) => (
              <Link
                key={item.id}
                href={item.href}
                className="font-medium transition-opacity hover:opacity-70"
                style={{ color: "var(--ink)" }}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </header>
  );
}