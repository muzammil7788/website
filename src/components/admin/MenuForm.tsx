"use client";

import { useState } from "react";
import { saveMenu, deleteMenu } from "@/app/admin/actions";
import { slugify } from "@/lib/utils";

type RefOption = { id: string; label: string };

type MenuItemInput = {
  label: string;
  kind: string;
  refId?: string;
  url?: string;
};

const inputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function MenuForm({
  menu,
  pages,
  posts,
}: {
  menu: {
    id?: string;
    name: string;
    slug?: string;
    items: { label: string; kind: string; refId?: string; url?: string }[];
  } | null;
  pages: RefOption[];
  posts: RefOption[];
}) {
  const [name, setName] = useState(menu?.name || "");
  const [slug, setSlug] = useState(menu?.slug || "");
  const [items, setItems] = useState<MenuItemInput[]>(
    menu ? menu.items.map((i) => ({ label: i.label, kind: i.kind, refId: i.refId, url: i.url })) : []
  );
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateItem(index: number, patch: Partial<MenuItemInput>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function deleteItem(index: number) {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }

  function addItem() {
    setItems((prev) => [...prev, { label: "", kind: "page", refId: pages[0]?.id, url: "" }]);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = await saveMenu({
      id: menu?.id,
      name,
      slug,
      items: items.filter((i) => i.label.trim()),
    });
    if (result?.error) {
      setError(result.error);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-5">
      {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Menu name</label>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!menu) setSlug(slugify(e.target.value));
            }}
            required
            className={inputCls}
          />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Slug</label>
          <input value={slug} onChange={(e) => setSlug(slugify(e.target.value))} className={inputCls} />
          <p className="mt-1 text-xs text-gray-400">
            Use slug <span className="font-mono">primary</span> or <span className="font-mono">footer</span> to place it.
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {items.length === 0 && <p className="text-center text-sm text-gray-500">No items yet.</p>}
        {items.map((item, index) => (
          <div key={index} className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 sm:grid-cols-[1fr_150px_1fr_auto]">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Label</label>
              <input
                value={item.label}
                onChange={(e) => updateItem(index, { label: e.target.value })}
                placeholder="Menu label"
                className={inputCls}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-500">Type</label>
              <select
                value={item.kind}
                onChange={(e) => updateItem(index, { kind: e.target.value })}
                className={inputCls}
              >
                <option value="page">Page</option>
                <option value="post">Post</option>
                <option value="external">Custom URL</option>
              </select>
            </div>
            <div>
              {item.kind === "external" ? (
                <>
                  <label className="mb-1 block text-xs font-medium text-gray-500">URL</label>
                  <input
                    value={item.url || ""}
                    onChange={(e) => updateItem(index, { url: e.target.value })}
                    placeholder="https://…"
                    className={inputCls}
                  />
                </>
              ) : (
                <>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    {item.kind === "page" ? "Page" : "Post"}
                  </label>
                  <select
                    value={item.refId || ""}
                    onChange={(e) => updateItem(index, { refId: e.target.value })}
                    className={inputCls}
                  >
                    {item.kind === "page" ? (
                      pages.length === 0 ? (
                        <option value="">No pages</option>
                      ) : (
                        pages.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.label}
                          </option>
                        ))
                      )
                    ) : posts.length === 0 ? (
                      <option value="">No posts</option>
                    ) : (
                      posts.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.label}
                        </option>
                      ))
                    )}
                  </select>
                </>
              )}
            </div>
            <button
              type="button"
              onClick={() => deleteItem(index)}
              className="self-end rounded-md border border-red-200 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addItem}
          className="rounded-md border border-dashed border-gray-300 px-3 py-2 text-sm text-gray-500 hover:border-indigo-400 hover:text-indigo-600"
        >
          + Add item
        </button>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
        >
          {loading ? "Saving…" : "Save menu"}
        </button>
        {menu?.id && (
          <button
            type="button"
            onClick={async () => {
              if (confirm("Delete this menu?")) await deleteMenu(menu.id!);
            }}
            className="rounded-md border border-red-200 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            Delete menu
          </button>
        )}
      </div>
    </form>
  );
}