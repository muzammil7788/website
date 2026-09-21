import PostForm from "@/components/admin/PostForm";

export default function NewPost() {
  return (
    <div>
      <h1 className="mb-6 text-2xl font-semibold">New post</h1>
      <PostForm post={null} />
    </div>
  );
}