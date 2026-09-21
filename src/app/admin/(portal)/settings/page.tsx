import { getSettings } from "@/lib/settings";
import { updateSettings } from "@/app/admin/actions";
import ChangePasswordForm from "@/components/admin/ChangePasswordForm";

export const dynamic = "force-dynamic";

const inputCls =
  "w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500";

export default async function SettingsPage() {
  const settings = await getSettings();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Site settings</h1>

      <form action={updateSettings} className="space-y-6 rounded-xl border border-gray-200 bg-white p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="siteName" className="mb-1 block text-sm font-medium text-gray-700">
              Site name
            </label>
            <input id="siteName" name="siteName" defaultValue={settings.siteName} className={inputCls} />
          </div>
          <div>
            <label htmlFor="tagline" className="mb-1 block text-sm font-medium text-gray-700">
              Tagline
            </label>
            <input id="tagline" name="tagline" defaultValue={settings.tagline} className={inputCls} />
          </div>
        </div>

        <div>
          <label htmlFor="siteDescription" className="mb-1 block text-sm font-medium text-gray-700">
            Meta description (defaults)
          </label>
          <textarea
            id="siteDescription"
            name="siteDescription"
            defaultValue={settings.siteDescription}
            rows={3}
            className={inputCls}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="theme" className="mb-1 block text-sm font-medium text-gray-700">
              Theme
            </label>
            <select id="theme" name="theme" defaultValue={settings.theme} className={inputCls}>
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System default</option>
            </select>
          </div>
          <div>
            <label htmlFor="accentColor" className="mb-1 block text-sm font-medium text-gray-700">
              Accent color
            </label>
            <input
              id="accentColor"
              name="accentColor"
              type="color"
              defaultValue={settings.accentColor}
              className="h-10 w-full cursor-pointer rounded-md border border-gray-300"
            />
          </div>
          <div>
            <label htmlFor="postsPerPage" className="mb-1 block text-sm font-medium text-gray-700">
              Posts per page
            </label>
            <input
              id="postsPerPage"
              name="postsPerPage"
              type="number"
              min={1}
              max={50}
              defaultValue={settings.postsPerPage}
              className={inputCls}
            />
          </div>
        </div>

        <div>
          <label htmlFor="logoUrl" className="mb-1 block text-sm font-medium text-gray-700">
            Logo URL
          </label>
          <input id="logoUrl" name="logoUrl" defaultValue={settings.logoUrl} placeholder="/uploads/logo.png" className={inputCls} />
        </div>

        <div>
          <label htmlFor="footerText" className="mb-1 block text-sm font-medium text-gray-700">
            Footer text
          </label>
          <input id="footerText" name="footerText" defaultValue={settings.footerText} className={inputCls} />
        </div>

        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-indigo-700"
        >
          Save settings
        </button>
      </form>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">Change password</h2>
        <ChangePasswordForm />
      </div>
    </div>
  );
}