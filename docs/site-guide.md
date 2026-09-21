# Site Guide & Process Reference

Complete operational documentation for deploying, running, extending and
debugging the site. The project is a self-hostable, browser-managed website:
a Next.js app, MySQL database, and a full admin panel.

---

## 1. Architecture overview

```
Browser
  ├── Public site  /            (SSR: pages, /pages/:slug, /blog, /blog/:slug)
  └── Admin portal /admin       (login-protected dashboard)
          │
          v
   Next.js 15 (App Router, Node 20+)
     ├── Server Actions        pages/posts/menus/settings writes (src/app/admin/actions.ts)
     ├── Route Handlers        login, logout, upload, media (src/app/api/...)
     ├── Middleware            JWT check on every /admin route (middleware.ts)
     └── Prisma ORM
          │
          v
        MySQL 8
          ├── website DB
          └── tables: User, Setting, Page, Post, Menu, MenuItem, Media
```

Data flow (public site): every request reads live from MySQL — edit in the
admin panel, save, and the public page updates immediately (`force-dynamic`).

---

## 2. Process: first-time setup (local)

```bash
npm install                       # install dependencies

cp .env.example .env              # create your env file
# edit .env:
#   DATABASE_URL="mysql://USER:PASSWORD@localhost:3306/website"
#   APP_SECRET="a-long-random-string"

npx prisma migrate dev            # apply schema to MySQL (dev)
npx prisma db seed                # create admin user + default content
npm run dev                       # start http://localhost:3000
```

Default admin login after seed:

- URL: `http://localhost:3000/admin`
- Email: `admin@example.com`
- Password: `admin1234`

Seeding with custom credentials:

```
ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=YourPass123 npx prisma db seed
```

> Important: `prisma migrate dev` (local) needs the DB user to be able to
> create a temporary shadow database. Production applies migrations with
> `prisma migrate deploy`, which needs no shadow database.

---

## 3. Process: bringing up a fresh machine / re-sync

```bash
git pull
npm ci                          # clean install matching package-lock.json
npx prisma migrate deploy       # apply schema to whatever MySQL the env points at
npm run dev
```

This is the recommended routine for moving between machines or deploying.

---

## 4. Process: database changes (schema evolution)

Files: `prisma/schema.prisma` (models) + `prisma/migrations/` (SQL history).

1. Edit `prisma/schema.prisma`.
2. `npx prisma migrate dev --name describe_change` → creates + applies a
   migration (dev only; also regenerates the Prisma client).
3. Review the generated `.sql`.
4. On other environments: `npx prisma migrate deploy`.

Browsing/interacting with the DB directly:

```bash
npx prisma studio                # web UI at prisma studio port
```

Troubleshooting a failed migration during development:

```bash
npx prisma migrate resolve --rolled-back <migration_name>   # after editing/fixing
npx prisma migrate reset --force                             # dev only, DROPS DATA
```

MySQL notes:

- Long text columns are `TEXT`, not `VARCHAR(191)` (MySQL forbids defaults on TEXT).
- `DATABASE_URL` format:
  `mysql://USER:PASSWORD@HOST:PORT/DATABASE?connection_limit=5`
- Use utf8mb4 for full Unicode support.

---

## 5. Process: editing content (everyday/admin)

All editing happens in the browser at `/admin`. Every save is immediate.

| Task | Where |
| --- | --- |
| Change site name / tagline / footer / SEO description | Settings |
| Change colors or light/dark/system theme | Settings → Accent color / Theme |
| Set logo | Upload to Media → paste URL into Settings → Logo URL |
| Add/edit/delete a page | Pages (title, slug, HTML content, SEO, homepage flag) |
| Add/edit/delete a blog post | Posts (title, slug, excerpt, cover image, HTML content) |
| Header / footer navigation | Menus — slug `primary` = header, `footer` = footer |
| Upload images/documents | Media (single or batch, copy URL, delete) |
| Change admin password | Settings → Change password |

Content is HTML. Supported styling in the `.content` block: headings, lists,
quotes, links, images, code blocks, preformatted blocks.

---

## 6. Process: theming

Site-wide colors are CSS variables defined in `src/app/globals.css`:

- `--accent` — buttons, links, active pagination (set from admin Settings)
- `--bg`, `--card`, `--border`, `--ink`, `--muted` — surfaces & text
- `data-theme="light|dark|system"` on `<html>` controls the theme (admin setting)

To add a brand-new theme: extend `html[data-theme="…"] {}` blocks in
`globals.css`, then the theme option appears in admin Settings.

---

## 7. Process: production deployment

### Option A — single Node server (recommended)

```bash
npm ci
npx prisma migrate deploy
ADMIN_EMAIL=... ADMIN_PASSWORD=... npx prisma db seed   # first deploy only
npm run build
npm run start                 # production server on :3000
```

- Run behind a reverse proxy (nginx / Caddy) with HTTPS.
- Restart the process with a process manager (systemd / pm2) after deploys.
- `public/uploads/` holds uploaded media — ensure it's on durable storage and
  included in backups.

### Option B — container/traditional host

Serve the built app with `node node_modules/next/dist/bin/next start` (or the
`npm run start` script) and route DB via `DATABASE_URL`. Migrations must run
before the app starts.

Environment variables required anywhere the app runs:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Prisma/MySQL connection string |
| `APP_SECRET` | Signs admin session cookies (must be long + random) |

---

## 8. Process: adding code (extension guide)

Project layout:

```
prisma/                    schema, migrations, seed
src/app/                   all routes
  ├── layout.tsx           root layout: loads settings, applies theme + fonts
  ├── page.tsx             home (renders the "home" page from DB)
  ├── pages/[slug]/        static pages
  ├── blog/ + blog/[slug]/ blog
  ├── admin/login/         login screen (no sidebar)
  ├── admin/(portal)/      everything behind the sidebar (dashboard, pages,
  │                        posts, menus, media, settings)
  └── api/                 route handlers (auth, upload, media)
src/components/site/       public site components (header, footer, shell)
src/components/admin/      admin UI components
src/lib/                   prisma client, auth, settings, site (menus), utils
middleware.ts              /admin JWT gate
```

Common extension patterns:

- **New content type** → add a model in `prisma/schema.prisma`, migrate, then
  add an admin list + form under `src/app/admin/(portal)/…` following the
  pages/posts pattern, plus a public route if needed.
- **New site setting** → add the key in `DEFAULT_SETTINGS` +
  the `allowed` set in `src/app/admin/actions.ts` + a field in the Settings page.
- **New public template/style** → new themes in `globals.css`; new layouts as
  components under `src/components/site/`.

Shared utilities: `src/lib/utils.ts` (`slugify`, `truncate`, `stripHtml`).

---

## 9. Process: authentication

- Login posts to `/api/auth/login` → bcrypt-compares the password, then sets a
  signed JWT (`HS256`) in the `website_session` httpOnly cookie (7 days).
- Every `/admin` route is checked by `middleware.ts`; invalid/absent tokens
  redirect to `/admin/login`. Admin server components double-check via
  `getCurrentUser()` in `src/lib/session.ts`.
- Logout (`POST /api/auth/logout`) deletes the cookie.
- Uploads/API endpoints verify the JWT themselves (`src/app/api/*/route.ts`).

Security notes:

- Never commit `.env`. It is gitignored.
- Change `APP_SECRET` after install; rotate it only while users can re-login.
- Change the default admin password after first login.
- In production the cookie is `Secure` (HTTPS only).

---

## 10. Process: media uploads

- Uploads go through `POST /api/upload` (JWT required) → saved to
  `public/uploads/<timestamp>-<uuid>-<name>` and a `Media` row is created.
- Listing: `GET /api/media` (JWT required), used by the media grid and the
  "Choose from library" picker on posts.
- Deletes: `DELETE /api/upload?id=…` removes the file and DB row.
- Uploads are gitignored (`public/uploads/`); back them up with the database.

---

## 11. Process: CI / quality gates

Run before pushing:

```bash
npm run typecheck        # TypeScript
npx eslint .             # lint
npm run build            # full production build (catches route/prerender errors)
```

If the build fails, the usual causes:

- Server component returns a serializable error (check `next dev` logs).
- Migration not applied on the target DB (`npx prisma migrate deploy`).
- Missing `.env` values on the build machine.

---

## 12. Troubleshooting FAQ

**Q: "User was denied access on the database `prisma_migrate_shadow_db…`"**
Grant the DB user rights to create/drop databases, or run `migrate deploy`.

**Q: "The provided value is too long for the column"**
That column is `VARCHAR`; long free text columns must be `@db.Text` in the schema.

**Q: Site changes take forever to appear**
Public pages are `force-dynamic`, so saves show immediately. If you removed
`dynamic`/`revalidate`, caching may kick in — server data is fetched on render.

**Q: Uploads 404 after deploy**
`public/uploads` must exist and be writable on the server
(`mkdir -p public/uploads`).

**Q: Login always fails**
Check `ADMIN_EMAIL`/`ADMIN_PASSWORD` used at seed time, and that
`APP_SECRET` is stable across restarts (otherwise sessions invalidate).

**Q: I can't reach `prisma migrate dev` (shadow DB) in production**
Use `npx prisma migrate deploy` on production databases.