import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PostForm from "@/components/admin/PostForm";

export const dynamic = "force-dynamic";

export default async function EditPost({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = await prisma.post.findUnique({ where: { id } });

  if (!post) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit post</h1>
      <PostForm
        post={{
          id: post.id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImage: post.coverImage || "",
          published: post.published,
        }}
      />
    </div>
  );
}