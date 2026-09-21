import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [pages, posts, media, menus] = await Promise.all([
    prisma.page.count(),
    prisma.post.count(),
    prisma.media.count(),
    prisma.menu.count(),
  ]);

  const recentPosts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const stats = [
    { label: "Pages", value: pages, href: "/admin/pages" },
    { label: "Posts", value: posts, href: "/admin/posts" },
    { label: "Menu items", value: menus, href: "/admin/menus" },
    { label: "Media files", value: media, href: "/admin/media" },
  ];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Dashboard</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
          >
            <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            <p className="mt-1 text-sm text-gray-500">{stat.label}</p>
          </Link>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <h2 className="font-semibold">Recent posts</h2>
          <Link href="/admin/posts/new" className="text-sm font-medium text-indigo-600 hover:underline">
            New post
          </Link>
        </div>
        {recentPosts.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-500">No posts yet. Create your first post.</p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recentPosts.map((post) => (
              <li key={post.id} className="flex items-center justify-between px-5 py-3">
                <div>
                  <Link href={`/admin/posts/${post.id}/edit`} className="font-medium hover:underline">
                    {post.title}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {post.published ? "Published" : "Draft"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}