import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getSettings, s } from "@/lib/settings";
import LogoutButton from "@/components/admin/LogoutButton";

const NAV = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/pages", label: "Pages" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/menus", label: "Menus" },
  { href: "/admin/media", label: "Media" },
  { href: "/admin/settings", label: "Settings" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");

  const settings = await getSettings();

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-900">
      <aside className="fixed inset-y-0 left-0 z-30 flex w-60 flex-col border-r border-gray-200 bg-white">
        <div className="flex items-center gap-3 border-b border-gray-200 px-5 py-4">
          {s(settings, "logoUrl") ? (
            <Image src={s(settings, "logoUrl")} alt="Logo" width={28} height={28} className="rounded" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded bg-indigo-600 font-bold text-white">
              {s(settings, "siteName").charAt(0).toUpperCase()}
            </span>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold">{s(settings, "siteName")}</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="block rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/"
            target="_blank"
            className="block rounded-md px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            View site ↗
          </Link>
        </nav>

        <div className="border-t border-gray-200 px-3 py-4">
          <div className="mb-3 px-3">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-gray-500">{user.email}</p>
          </div>
          <LogoutButton />
        </div>
      </aside>

      <div className="ml-60 flex-1">
        <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
      </div>
    </div>
  );
}