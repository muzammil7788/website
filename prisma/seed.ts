import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@example.com";
  const adminPassword = process.env.ADMIN_PASSWORD || "admin1234";

  const passwordHash = bcrypt.hashSync(adminPassword, 10);

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: { email: adminEmail, passwordHash, name: "Administrator", role: "admin" },
  });

  const defaultSettings: Record<string, string> = {
    siteName: "My Website",
    tagline: "Welcome to my website",
    siteDescription: "A customizable website built to be deployed anywhere.",
    theme: "light",
    accentColor: "#4f46e5",
    footerText: "",
    logoUrl: "",
    postsPerPage: "9",
  };

  for (const [key, value] of Object.entries(defaultSettings)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  const homeContent = `
<h2>Hello, world</h2>
<p>This is the homepage. Add anything you like here — text, images, links, lists and more.</p>
<p>Edit this page in the admin panel at <strong>Pages</strong>, or change site-wide options under <strong>Settings</strong>.</p>
<ul>
  <li>Pages for static content</li>
  <li>Posts for a blog</li>
  <li>Menus for navigation</li>
  <li>Media library for uploads</li>
</ul>
`;

  await prisma.page.upsert({
    where: { slug: "home" },
    update: { isHome: true, published: true },
    create: {
      title: "Home",
      slug: "home",
      content: homeContent,
      isHome: true,
      published: true,
      metaTitle: "Welcome",
      metaDescription: "Welcome to our website.",
    },
  });

  await prisma.page.upsert({
    where: { slug: "about" },
    update: {},
    create: {
      title: "About",
      slug: "about",
      content:
        "<h2>About us</h2>\n<p>Tell visitors who you are. This page is fully editable from the admin panel.</p>",
      published: true,
      order: 1,
    },
  });

  const samplePosts = [
    {
      title: "Getting started",
      slug: "getting-started",
      excerpt: "Everything you need to know to make this site yours.",
      content:
        "<h2>Make it yours</h2>\n<p>Log in to the admin panel, write posts, create pages, organize menus and upload images — all from the browser.</p>",
    },
    {
      title: "Theming is built in",
      slug: "theming-is-built-in",
      excerpt: "Switch between light and dark, and pick any accent color.",
      content:
        "<h2>Change the look</h2>\n<p>Open <strong>Settings</strong> to change the accent color, theme and more. The whole site updates instantly.</p>",
    },
  ];

  for (const post of samplePosts) {
    await prisma.post.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        title: post.title,
        slug: post.slug,
        excerpt: post.excerpt,
        content: post.content,
        published: true,
      },
    });
  }

  const homePage = await prisma.page.findUnique({ where: { slug: "home" } });
  const aboutPage = await prisma.page.findUnique({ where: { slug: "about" } });

  await prisma.menu.upsert({
    where: { slug: "primary" },
    update: {},
    create: {
      name: "Primary menu",
      slug: "primary",
      items: {
        create: [
          { label: "Home", kind: "page", refId: homePage?.id, sortOrder: 0 },
          { label: "About", kind: "page", refId: aboutPage?.id, sortOrder: 1 },
          { label: "Blog", kind: "external", url: "/blog", sortOrder: 2 },
        ],
      },
    },
  });

  await prisma.menu.upsert({
    where: { slug: "footer" },
    update: {},
    create: {
      name: "Footer menu",
      slug: "footer",
      items: {
        create: [{ label: "About", kind: "page", refId: aboutPage?.id, sortOrder: 0 }],
      },
    },
  });

  console.log("Seed complete.");
  console.log(`  Admin login: ${adminEmail} / ${adminPassword}`);
  console.log("  Change the password from the admin Settings page.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());