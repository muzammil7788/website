"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type MediaItem = {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
};

type Props = {
  value: string;
  onChange: (url: string) => void;
};

export default function MediaPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch("/api/media")
      .then((r) => r.json())
      .then((data) => setItems(data.items || []))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [open]);

  return (
    <div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="/uploads/cover.png or https://..."
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 rounded-md border border-gray-300 px-3 py-1.5 text-xs font-medium text-gray-600 transition-colors hover:bg-gray-50"
      >
        Choose from library
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Media library</h3>
              <button onClick={() => setOpen(false)} className="text-sm text-gray-500 hover:text-gray-900">
                Close
              </button>
            </div>
            {loading ? (
              <p className="py-8 text-center text-sm text-gray-500">Loading…</p>
            ) : items.length === 0 ? (
              <p className="py-8 text-center text-sm text-gray-500">
                No files yet. Upload some in the Media section.
              </p>
            ) : (
              <div className="grid max-h-96 grid-cols-3 gap-3 overflow-y-auto sm:grid-cols-4">
                {items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      onChange(item.url);
                      setOpen(false);
                    }}
                    className="group overflow-hidden rounded-lg border border-gray-200"
                  >
                    {item.mimeType.startsWith("image/") ? (
                      <div className="relative aspect-square w-full">
                        <Image src={item.url} alt={item.filename} fill className="object-cover" />
                      </div>
                    ) : (
                      <div className="flex aspect-square w-full items-center justify-center text-xs text-gray-500">
                        {item.filename}
                      </div>
                    )}
                    <p className="truncate bg-gray-50 px-2 py-1 text-[11px] text-gray-500">{item.filename}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}