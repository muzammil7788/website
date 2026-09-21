import Link from "next/link";
import LoginForm from "@/components/admin/LoginForm";
import { getSettings, s } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function LoginPage() {
  const settings = await getSettings();

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4">
      <div className="w-full max-w-sm">
        <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
          <div className="mb-6 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 font-bold text-white">
              {s(settings, "siteName").charAt(0).toUpperCase()}
            </span>
            <h1 className="text-xl font-semibold text-gray-900">{s(settings, "siteName")}</h1>
            <p className="text-sm text-gray-500">Sign in to the admin panel</p>
          </div>
          <LoginForm />
          <p className="mt-6 text-center text-xs text-gray-400">
            <Link href="/" className="hover:underline">
              ← Back to site
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}