import { cache } from "react";
import { prisma } from "@/lib/prisma";

export type ResolvedMenuItem = {
  id: string;
  label: string;
  href: string;
  menuId: string;
};

export const getMenus = cache(async (): Promise<{
  primary: ResolvedMenuItem[];
  footer: ResolvedMenuItem[];
}> => {
  const menus = await prisma.menu.findMany({
    include: {
      items: {
        orderBy: { sortOrder: "asc" },
      },
    },
  });

  const bySlug: Record<string, ResolvedMenuItem[]> = {};
  const pageRefs = menus
    .flatMap((m) => m.items)
    .filter((i) => i.kind === "page" && i.refId)
    .map((i) => i.refId!);
  const postRefs = menus
    .flatMap((m) => m.items)
    .filter((i) => i.kind === "post" && i.refId)
    .map((i) => i.refId!);

  const pages = await prisma.page.findMany({
    where: { id: { in: pageRefs } },
    select: { id: true, slug: true },
  });
  const posts = await prisma.post.findMany({
    where: { id: { in: postRefs } },
    select: { id: true, slug: true },
  });
  const pageSlug = new Map(pages.map((p) => [p.id, p.slug]));
  const postSlug = new Map(posts.map((p) => [p.id, p.slug]));

  for (const menu of menus) {
    bySlug[menu.slug] = menu.items.map((item) => {
      let href = "#";
      if (item.kind === "page") {
        const slug = pageSlug.get(item.refId || "");
        href = slug ? (slug === "home" ? "/" : `/pages/${slug}`) : "#";
      } else if (item.kind === "post") {
        const slug = postSlug.get(item.refId || "");
        href = slug ? `/blog/${slug}` : "#";
      } else if (item.kind === "external") {
        href = item.url || "#";
      }
      return { id: item.id, label: item.label, href, menuId: menu.slug };
    });
  }

  return {
    primary: bySlug["primary"] || [],
    footer: bySlug["footer"] || [],
  };
});