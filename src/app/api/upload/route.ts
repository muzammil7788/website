import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { prisma } from "@/lib/prisma";
import { getSessionToken, verifySession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const token = await getSessionToken();
  if (!(await verifySession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const filename = `${Date.now()}-${randomUUID().slice(0, 8)}-${safeName}`;
  const uploadDir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(uploadDir, { recursive: true });
  await fs.writeFile(path.join(uploadDir, filename), bytes);

  const url = `/uploads/${filename}`;
  const media = await prisma.media.create({
    data: {
      filename,
      url,
      mimeType: file.type || "application/octet-stream",
      size: bytes.length,
    },
  });

  return NextResponse.json({ url, media }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const token = await getSessionToken();
  if (!(await verifySession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const media = await prisma.media.findUnique({ where: { id } });
  if (!media) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    await fs.unlink(path.join(process.cwd(), "public", media.url));
  } catch {}

  await prisma.media.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}