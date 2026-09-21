import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePage } from "@/app/admin/actions";

export const dynamic = "force-dynamic";

export default async function AdminPagesPage() {
  const pages = await prisma.page.findMany({ orderBy: { order: "asc" } });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Pages</h1>
        <Link
          href="/admin/pages/new"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          New page
        </Link>
      </div>

      {pages.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-500">
          No pages yet. Create your first page.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-5 py-3 font-medium">Title</th>
                <th className="px-5 py-3 font-medium">Slug</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page.id}>
                  <td className="px-5 py-3 font-medium">
                    {page.title}
                    {page.isHome && (
                      <span className="ml-2 rounded bg-indigo-100 px-1.5 py-0.5 text-xs text-indigo-700">Home</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500">{page.slug}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        page.published ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                      }`}
                    >
                      {page.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="flex justify-end gap-4 px-5 py-3">
                    <Link
                      href={`/pages/${page.slug}`}
                      target="_blank"
                      className="font-medium text-gray-500 hover:text-gray-900"
                    >
                      View
                    </Link>
                    <Link href={`/admin/pages/${page.id}/edit`} className="font-medium text-indigo-600 hover:underline">
                      Edit
                    </Link>
                    <form action={deletePage.bind(null, page.id)}>
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