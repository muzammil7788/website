# Website

A self-hostable, browser-managed website. Anyone can deploy it on their own server, then run the entire site from a built-in admin panel — pages, blog posts, navigation menus, media, and site-wide theming — without touching code.

## Features

- **Public site** server-rendered for speed and SEO
  - Static pages (`/pages/your-slug`)
  - Blog with listing + pagination (`/blog`)
  - Configurable navigation (header + footer menus)
  - Site-wide settings (name, tagline, meta description, footer text)
  - Theming: light / dark / system, plus any accent color
- **Admin panel** at `/admin` (login-protected)
  - Dashboard with site stats and recent posts
  - Pages CRUD (draft/publish, set homepage, SEO fields)
  - Posts/blog CRUD (excerpt, cover image, draft/publish)
  - Menu builder (reorderable, links to pages/posts or custom URLs)
  - Media library (upload, browse, copy URL, delete)
  - Site settings + change password

## Stack

- **Next.js 15** (App Router, React 19, TypeScript, Tailwind CSS 4)
- **Node.js** 20+
- **MySQL 8** via **Prisma** ORM
- Auth: signed JWT in an httpOnly cookie (bcrypt password hashing)

## Prerequisites

- Node.js 20+
- MySQL 8 running locally or reachable

## Quick start

```bash
npm install

# 1. Configure the database connection
cp .env.example .env
# then edit .env:
#   DATABASE_URL="mysql://user:password@localhost:3306/website"
#   APP_SECRET="a-long-random-string"

# 2. Create the database schema and apply migrations
npx prisma migrate dev

# 3. Seed default content + admin user (admin@example.com / admin1234)
npx prisma db seed

# 4. Start the site
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the public site and
[http://localhost:3000/admin](http://localhost:3000/admin) for the admin panel.

> Change the default admin password under **Settings** in the admin panel after first login.

## Admin default login

- Email: `admin@example.com`
- Password: `admin1234`

To use different credentials at seed time, set `ADMIN_EMAIL` and `ADMIN_PASSWORD`:
`ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=yourPass123 npx prisma db seed`

## Customization without code

| Need | Where |
| --- | --- |
| Site name, tagline, footer text | Admin → Settings |
| Logo | Upload in Media, set Logo URL in Settings |
| Colors / theme (light·dark·system) | Admin → Settings |
| Pages (HTML content, SEO fields, homepage) | Admin → Pages |
| Blog articles | Admin → Posts |
| Header / footer navigation | Admin → Menus (slug `primary` = header, `footer` = bottom) |
| Images / documents | Admin → Media |

Content is stored as HTML in the admin editor so you can structure it freely
(headings, paragraphs, lists, quotes, images, code blocks).

## Database schema

Generated tables: `User`, `Setting`, `Page`, `Post`, `Menu`, `MenuItem`, `Media`.
See `prisma/schema.prisma`. After editing the schema:

```bash
npx prisma migrate dev --name describe_change
```

## Production deployment

### On any Node server (recommended)

```bash
npm ci
npx prisma migrate deploy
npx prisma db seed   # once, or with ADMIN_EMAIL/ADMIN_PASSWORD set
npm run build
npm run start        # production server on :3000
```

Put it behind a reverse proxy (nginx/Caddy) with HTTPS. Uploads are written to
`public/uploads`, which should be on durable storage.

### MySQL specifics

`DATABASE_URL` uses the format:

```
mysql://USER:PASSWORD@HOST:PORT/DATABASE?connection_limit=5
```

Run `npx prisma migrate deploy` to apply schema migrations without resetting data.

For `prisma migrate dev` (local development) the database user needs rights to
create a temporary shadow database.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Local dev server |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run typecheck` | TypeScript check |
| `npx eslint .` | Lint |
| `npx prisma migrate dev` | Create/apply migrations for dev |
| `npx prisma migrate deploy` | Apply migrations to a server DB |
| `npx prisma db seed` | Seed default content |
| `npx prisma studio` | Browse/edit the DB from the browser |

## Documentation

- **[Site Guide & Process Reference](docs/site-guide.md)** — everything about
  architecture, setup, migrations, theming, extending the code, production
  deployment, authentication, uploads, quality gates, and troubleshooting.

## Repository layout

```
prisma/            schema + migrations + seed
src/app/           Next.js routes (public site, /admin portal, /api)
src/components/    site + admin UI components
src/lib/           prisma client, auth, settings, site helpers, utils
public/uploads/    uploaded media (runtime, gitignored)
docs/              process reference documentation
```