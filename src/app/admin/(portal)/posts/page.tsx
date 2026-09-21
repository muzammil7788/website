import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePost } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminPostsPage() {
  const posts = await prisma.post.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Posts</h1>
        <Link
          href="/admin/posts/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No posts yet. Create your first blog post.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Date</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="px-5 py-3 font-medium">{post.title}</td>
                  <td className="px-5 py-3 text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        post.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="flex justify-end gap-4 px-5 py-3">
                    <Link href={`/blog/${post.slug}`} target="_blank" className="font-medium text-gray-500 hover:text-gray-900">
                      View
                    </Link>
                    <Link href={`/admin/posts/${post.id}/edit`} className="font-medium text-indigo-600 hover:underline">
                      Edit
                    </Link>
                    <form action={deletePost.bind(null, post.id)}>
                      <button type="submit" className="font-medium text-red-600 hover:underline">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}