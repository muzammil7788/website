import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import PageForm from "@/components/admin/PageForm";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const page = await prisma.page.findUnique({ where: { id } });

  if (!page) notFound();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Edit page</h1>
      <PageForm
        page={{
          id: page.id,
          title: page.title,
          slug: page.slug,
          content: page.content,
          metaTitle: page.metaTitle || "",
          metaDescription: page.metaDescription || "",
          isHome: page.isHome,
          published: page.published,
        }}
      />
    </div>
  );
}