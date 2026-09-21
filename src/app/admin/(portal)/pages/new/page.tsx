import PageForm from "@/components/admin/PageForm";

export default function NewPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New page</h1>
      <PageForm page={null} />
    </div>
  );
}