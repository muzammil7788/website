import MenuForm from "@/components/admin/MenuForm";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminMenusPage() {
  const [menus, pages, posts] = await Promise.all([
    prisma.menu.findMany({ include: { items: { orderBy: { sortOrder: "asc" } } } }),
    prisma.page.findMany({ orderBy: { order: "asc" } }),
    prisma.post.findMany({ orderBy: { createdAt: "desc" } }),
  ]);

  const pageOptions = pages.map((p) => ({ id: p.id, label: p.title }));
  const postOptions = posts.map((p) => ({ id: p.id, label: p.title }));

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Menus</h1>
      <p className="mb-6 max-w-2xl text-sm text-gray-500">
        Create a menu with slug <span className="font-mono">primary</span> to show it in the site header, or{" "}
        <span className="font-mono">footer</span> to show it in the footer. Order items top to bottom.
      </p>

      <div className="space-y-6">
        {menus.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center text-sm text-gray-500">
            No menus yet. Add your first menu below.
          </div>
        )}
        {menus.map((menu) => (
          <MenuForm
            key={menu.id}
            menu={{
              id: menu.id,
              name: menu.name,
              slug: menu.slug,
              items: menu.items.map((i) => ({
                label: i.label,
                kind: i.kind,
                refId: i.refId || undefined,
                url: i.url || undefined,
              })),
            }}
            pages={pageOptions}
            posts={postOptions}
          />
        ))}
        <MenuForm menu={null} pages={pageOptions} posts={postOptions} />
      </div>
    </div>
  );
}