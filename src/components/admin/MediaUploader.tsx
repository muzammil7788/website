"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

type MediaItem = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
};

export default function MediaUploader() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(() => {
    fetch("/api/media")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []));
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setLoading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        await fetch("/api/upload", { method: "POST", body: formData });
        await new Promise((r) => setTimeout(r, 150));
      }
      load();
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this file?")) return;
    await fetch(`/api/upload?id=${id}`, { method: "DELETE" });
    load();
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
          className="hidden"
          id="fileInput"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <label
          htmlFor="fileInput"
          className="cursor-pointer rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          {loading ? "Uploading…" : "Upload files"}
        </label>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-sm font-medium text-gray-500 hover:text-gray-900"
        >
          or open file dialog
        </button>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-gray-300 bg-white p-12 text-center text-sm text-gray-500">
          No files yet. Upload images, videos or documents here.
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <div key={item.id} className="overflow-hidden rounded-xl border border-gray-200 bg-white">
              <div className="relative aspect-square w-full bg-gray-100">
                {item.mimeType.startsWith("image/") ? (
                  <Image src={item.url} alt={item.filename} fill className="object-cover" />
                ) : item.mimeType.startsWith("video/") ? (
                  <video src={item.url} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-gray-400">{item.mimeType}</div>
                )}
              </div>
              <div className="p-3">
                <p className="truncate text-xs font-medium text-gray-700">{item.filename}</p>
                <p className="mt-0.5 text-[11px] text-gray-400">{formatSize(item.size)}</p>
                <div className="mt-2 flex items-center justify-between">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.url);
                      alert(`Copied: ${item.url}`);
                    }}
                    className="text-xs font-medium text-indigo-600 hover:underline"
                  >
                    Copy URL
                  </button>
                  <button onClick={() => handleDelete(item.id)} className="text-xs font-medium text-red-600 hover:underline">
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}