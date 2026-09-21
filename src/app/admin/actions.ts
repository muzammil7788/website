"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { saveSettings as persistSettings } from "@/lib/settings";
import { slugify } from "@/lib/utils";

async function ensureAdmin() {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  return user;
}

export async function updateSettings(formData: FormData) {
  await ensureAdmin();
  const allowed = new Set([
    "siteName",
    "tagline",
    "siteDescription",
    "theme",
    "accentColor",
    "footerText",
    "logoUrl",
    "postsPerPage",
  ]);
  const entries: Record<string, string> = {};
  for (const key of allowed) {
    const value = formData.get(key);
    if (typeof value === "string") {
      entries[key] = value;
    }
  }
  await persistSettings(entries);
  revalidatePath("/", "layout");
  redirect("/admin/settings");
}

export async function savePage(data: {
  id?: string;
  title: string;
  slug?: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isHome?: boolean;
  published?: boolean;
}) {
  await ensureAdmin();
  const title = data.title.trim();
  if (!title) return { error: "Title is required" };
  const slug = slugify(data.slug || data.title) || slugify(title);
  const payload = {
    title,
    slug,
    content: data.content,
    metaTitle: data.metaTitle?.trim() || null,
    metaDescription: data.metaDescription?.trim() || null,
    isHome: Boolean(data.isHome),
    published: Boolean(data.published),
  };

  if (data.id) {
    const existing = await prisma.page.findFirst({
      where: { slug, NOT: { id: data.id } },
    });
    if (existing) return { error: `A page with slug "${slug}" already exists` };
    if (payload.isHome) {
      await prisma.page.updateMany({ where: { isHome: true }, data: { isHome: false } });
    }
    await prisma.page.update({ where: { id: data.id }, data: payload });
  } else {
    const existing = await prisma.page.findUnique({ where: { slug } });
    if (existing) return { error: `A page with slug "${slug}" already exists` };
    if (payload.isHome) {
      await prisma.page.updateMany({ where: { isHome: true }, data: { isHome: false } });
    }
    await prisma.page.create({ data: payload });
  }

  revalidatePath("/", "layout");
  redirect("/admin/pages");
}

export async function deletePage(id: string) {
  await ensureAdmin();
  await prisma.page.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/pages");
}

export async function savePost(data: {
  id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  published?: boolean;
}) {
  await ensureAdmin();
  const title = data.title.trim();
  if (!title) return { error: "Title is required" };
  const slug = slugify(data.slug || data.title);
  const payload = {
    title,
    slug,
    excerpt: data.excerpt,
    content: data.content,
    coverImage: data.coverImage?.trim() || null,
    published: Boolean(data.published),
  };

  if (data.id) {
    const existing = await prisma.post.findFirst({ where: { slug, NOT: { id: data.id } } });
    if (existing) return { error: `A post with slug "${slug}" already exists` };
    await prisma.post.update({ where: { id: data.id }, data: payload });
  } else {
    const existing = await prisma.post.findUnique({ where: { slug } });
    if (existing) return { error: `A post with slug "${slug}" already exists` };
    await prisma.post.create({ data: payload });
  }

  revalidatePath("/", "layout");
  redirect("/admin/posts");
}

export async function deletePost(id: string) {
  await ensureAdmin();
  await prisma.post.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/posts");
}

export async function saveMenu(data: {
  id?: string;
  name: string;
  slug?: string;
  items: { label: string; kind: string; refId?: string; url?: string }[];
}) {
  await ensureAdmin();
  const name = data.name.trim();
  if (!name) return { error: "Menu name is required" };
  const slug = slugify(data.slug || data.name) || slugify(name);

  const items = (data.items || [])
    .filter((i) => i.label.trim())
    .map((item, index) => ({
      label: item.label.trim(),
      kind: ["page", "post", "external"].includes(item.kind) ? item.kind : "external",
      refId: item.kind === "external" ? null : item.refId || null,
      url: item.kind === "external" ? item.url?.trim() || "#" : null,
      sortOrder: index,
    }));

  const menuData = { name, slug, items: { create: items } };
  if (data.id) {
    await prisma.$transaction([
      prisma.menuItem.deleteMany({ where: { menuId: data.id } }),
      prisma.menu.update({
        where: { id: data.id },
        data: { name, slug },
      }),
    ]);
    if (items.length > 0) {
      await prisma.menuItem.createMany({ data: items.map((i) => ({ ...i, menuId: data.id! })) });
    }
  } else {
    const existing = await prisma.menu.findUnique({ where: { slug } });
    if (existing) return { error: `A menu with slug "${slug}" already exists` };
    await prisma.menu.create({ data: menuData });
  }

  revalidatePath("/", "layout");
  redirect("/admin/menus");
}

export async function deleteMenu(id: string) {
  await ensureAdmin();
  await prisma.menu.delete({ where: { id } });
  revalidatePath("/", "layout");
  redirect("/admin/menus");
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
  const user = await ensureAdmin();
  if (!data.currentPassword || data.newPassword.length < 8) {
    return { error: "New password must be at least 8 characters" };
  }
  const full = await prisma.user.findUnique({ where: { id: user.id } });
  if (!full || !bcrypt.compareSync(data.currentPassword, full.passwordHash)) {
    return { error: "Current password is incorrect" };
  }
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: bcrypt.hashSync(data.newPassword, 10) },
  });
  return { ok: true };
}