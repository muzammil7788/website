"use client";

import { useState } from "react";
import { changePassword } from "@/app/admin/actions";

const inputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default function ChangePasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);
    setLoading(true);
    const result = await changePassword({ currentPassword, newPassword });
    setLoading(false);
    if (result.ok) {
      setMessage({ type: "ok", text: "Password changed." });
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setMessage({ type: "error", text: result.error || "Could not change password" });
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-sm space-y-4">
      <div>
        <label htmlFor="current" className="mb-1 block text-sm font-medium text-gray-700">
          Current password
        </label>
        <input
          id="current"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
          className={inputCls}
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="mb-1 block text-sm font-medium text-gray-700">
          New password (min 8 chars)
        </label>
        <input
          id="newPassword"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={8}
          className={inputCls}
        />
      </div>
      {message && (
        <p className={`text-sm ${message.type === "ok" ? "text-green-600" : "text-red-600"}`}>{message.text}</p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700 disabled:opacity-60"
      >
        {loading ? "Saving…" : "Update password"}
      </button>
    </form>
  );
}