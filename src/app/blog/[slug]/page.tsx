import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PublicShell from "@/components/site/PublicShell";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });
  if (!post) return {};
  return {
    title: post.title,
    description: post.excerpt || undefined,
  };
}

export default async function PostView({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.post.findUnique({ where: { slug } });

  if (!post || !post.published) {
    notFound();
  }

  return (
    <PublicShell>
      <article className="mx-auto max-w-3xl px-4 py-12">
        <Link href="/blog" className="text-sm font-medium" style={{ color: "var(--accent)" }}>
          ← Back to blog
        </Link>
        <h1 className="mt-4 mb-2 text-3xl font-bold sm:text-4xl">{post.title}</h1>
        <p className="mb-8 text-sm" style={{ color: "var(--muted)" }}>
          Published on{" "}
          {new Date(post.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
        {post.coverImage && (
          <div className="relative mb-8 aspect-[16/9] w-full overflow-hidden rounded-xl">
            <Image src={post.coverImage} alt={post.title} fill className="object-cover" />
          </div>
        )}
        <div className="content" dangerouslySetInnerHTML={{ __html: post.content }} />
      </article>
    </PublicShell>
  );
}