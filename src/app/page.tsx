import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getSettings, s } from "@/lib/settings";
import PublicShell from "@/components/site/PublicShell";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: s(settings, "siteName"),
    description: s(settings, "siteDescription"),
  };
}

export default async function HomePage() {
  const settings = await getSettings();
  const page =
    (await prisma.page.findFirst({ where: { isHome: true, published: true } })) ||
    (await prisma.page.findUnique({ where: { slug: "home" } }));

  if (!page) {
    notFound();
  }

  return (
    <PublicShell>
      {page.content ? (
        <article className="mx-auto max-w-3xl px-4 py-12">
          <h1 className="mb-6 text-3xl font-bold">{page.title}</h1>
          <div className="content" dangerouslySetInnerHTML={{ __html: page.content }} />
        </article>
      ) : (
        <section className="mx-auto flex max-w-4xl flex-col items-center px-4 py-24 text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">{s(settings, "siteName")}</h1>
          <p className="mt-4 text-lg" style={{ color: "var(--muted)" }}>
            {s(settings, "tagline")}
          </p>
          <a
            href="#"
            className="mt-8 rounded-full px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
            style={{ background: "var(--accent)" }}
          >
            Get started
          </a>
        </section>
      )}
    </PublicShell>
  );
}