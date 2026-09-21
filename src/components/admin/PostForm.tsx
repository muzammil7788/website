"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { savePost } from "@/app/admin/actions";
import { slugify } from "@/lib/utils";
import MediaPicker from "@/components/admin/MediaPicker";

type PostData = {
  id?: string;
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  coverImage?: string;
  published?: boolean;
};

const inputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function PostForm({ post }: { post: PostData | null }) {
  const router = useRouter();
  const [title, setTitle] = useState(post?.title || "");
  const [slug, setSlug] = useState(post?.slug || "");
  const [excerpt, setExcerpt] = useState(post?.excerpt || "");
  const [content, setContent] = useState(post?.content || "");
  const [coverImage, setCoverImage] = useState(post?.coverImage || "");
  const [published, setPublished] = useState(post ? Boolean(post.published) : true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await savePost({
      id: post?.id,
      title,
      slug,
      excerpt,
      content,
      coverImage,
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
            if (!post || !slug) setSlug(slugify(e.target.value));
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
      </div>

      <div>
        <label htmlFor="excerpt" className="mb-1 block text-sm font-medium text-gray-700">
          Excerpt
        </label>
        <textarea id="excerpt" value={excerpt} onChange={(e) => setExcerpt(e.target.value)} rows={3} className={inputCls} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-gray-700">Cover image</label>
        <MediaPicker value={coverImage} onChange={setCoverImage} />
      </div>

      <div>
        <label htmlFor="content" className="mb-1 block text-sm font-medium text-gray-700">
          Content (HTML)
        </label>
        <textarea
          id="content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={18}
          className={`${inputCls} font-mono`}
          placeholder="<p>Your article…</p>"
        />
      </div>

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input type="checkbox" checked={published} onChange={(e) => setPublished(e.target.checked)} className="h-4 w-4" />
        Published
      </label>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save post"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/posts")}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}