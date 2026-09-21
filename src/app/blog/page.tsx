import Link from "next/link";
import type { Metadata } from "next";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { getSettings, s } from "@/lib/settings";
import PublicShell from "@/components/site/PublicShell";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: "Blog",
    description: `Latest posts from ${s(settings, "siteName")}`,
  };
}

export default async function BlogIndex({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const params = await searchParams;
  const settings = await getSettings();
  const perPage = Math.max(1, parseInt(s(settings, "postsPerPage") || "9", 10) || 9);
  const pageNum = Math.max(1, parseInt(params.page || "1", 10) || 1);

  const [posts, total] = await Promise.all([
    prisma.post.findMany({
      where: { published: true },
      orderBy: { createdAt: "desc" },
      skip: (pageNum - 1) * perPage,
      take: perPage,
    }),
    prisma.post.count({ where: { published: true } }),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / perPage));

  return (
    <PublicShell>
      <div className="mx-auto max-w-6xl px-4 py-12">
        <h1 className="mb-8 text-3xl font-bold">Blog</h1>

        {posts.length === 0 ? (
          <p style={{ color: "var(--muted)" }}>No posts published yet.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group overflow-hidden rounded-xl border transition-shadow hover:shadow-lg"
                style={{ borderColor: "var(--border)", background: "var(--card)" }}
              >
                {post.coverImage && (
                  <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <Image
                      src={post.coverImage}
                      alt={post.title}
                      fill
                      className="object-cover transition-transform group-hover:scale-105"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h2 className="mb-2 text-lg font-semibold group-hover:underline">{post.title}</h2>
                  {post.excerpt && (
                    <p className="line-clamp-2 text-sm" style={{ color: "var(--muted)" }}>
                      {post.excerpt}
                    </p>
                  )}
                  <p className="mt-3 text-xs" style={{ color: "var(--muted)" }}>
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="mt-10 flex items-center justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={n === 1 ? "/blog" : `/blog?page=${n}`}
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-medium ${
                  n === pageNum ? "text-white" : ""
                }`}
                style={n === pageNum ? { background: "var(--accent)" } : { color: "var(--ink)" }}
              >
                {n}
              </Link>
            ))}
          </nav>
        )}
      </div>
    </PublicShell>
  );
}