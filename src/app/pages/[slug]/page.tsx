import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PublicShell from "@/components/site/PublicShell";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });
  if (!page) return {};
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription || undefined,
  };
}

export default async function PageView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.page.findUnique({ where: { slug } });

  if (!page || !page.published) {
    notFound();
  }

  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="mb-2 text-3xl font-bold">{page.title}</h1>
        <div className="content" dangerouslySetInnerHTML={{ __html: page.content }} />
      </article>
    </PublicShell>
  );
}