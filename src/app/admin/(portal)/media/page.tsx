import MediaUploader from "@/components/admin/MediaUploader";

export default function AdminMediaPage() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">Media library</h1>
      <MediaUploader />
    </div>
  );
}