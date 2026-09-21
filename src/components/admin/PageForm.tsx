"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePage } from "@/app/admin/actions";
import { slugify } from "@/lib/utils";

type PageData = {
  id?: string;
  title: string;
  slug?: string;
  content: string;
  metaTitle?: string;
  metaDescription?: string;
  isHome?: boolean;
  published?: boolean;
};

const inputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function PageForm({ page }: { page: PageData | null }) {
  const router = useRouter();
  const [title, setTitle] = useState(page?.title || "");
  const [slug, setSlug] = useState(page?.slug || "");
  const [content, setContent] = useState(page?.content || "");
  const [metaTitle, setMetaTitle] = useState(page?.metaTitle || "");
  const [metaDescription, setMetaDescription] = useState(page?.metaDescription || "");
  const [isHome, setIsHome] = useState(Boolean(page?.isHome));
  const [published, setPublished] = useState(page ? Boolean(page.published) : true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await savePage({
      id: page?.id,
      title,
      slug,
      content,
      metaTitle,
      metaDescription,
      isHome,
      published,
    });
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div>
        <label htmlFor="title" className="mb-1 block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (!page || !slug) setSlug(slugify(e.target.value));
          }}
          required
          className={inputCls}
        />
      </div>

      <div>
        <label htmlFor="slug" className="mb-1 block text-sm font-medium text-gray-700">
          Slug
        </label>
        <input id="slug" value={slug} onChange={(e) => setSlug(slugify(e.target.value))} className={inputCls} />
        <p className="mt-1 text-xs text-gray-400">Leave empty to auto-generate from the title.</p>
      </div>

      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-medium text-gray-700">
          Content (HTML)
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={16}
          className={`${inputCls} font-mono`}
          placeholder="<h2>Hello</h2>..."
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="metaTitle" className="mb-1 block text-sm font-medium text-gray-700">
            SEO title (optional)
          </label>
          <input id="metaTitle" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} className={inputCls} />
        </div>
        <div>
          <label htmlFor="metaDescription" className="mb-1 block text-sm font-medium text-gray-700">
            SEO description (optional)
          </label>
          <input
            id="metaDescription"
            value={metaDescription}
            onChange={(e) => setMetaDescription(e.target.value)}
            className={inputCls}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={isHome} onChange={(e) => setIsHome(e.target.checked)} className="h-4 w-4" />
          Set as homepage
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="h-4 w-4"
          />
          Published
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save page"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/pages")}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}