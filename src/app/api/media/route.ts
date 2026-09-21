import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionToken, verifySession } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const token = await getSessionToken();
  if (!(await verifySession(token))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const items = await prisma.media.findMany({
    where: query ? { filename: { contains: query } } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return NextResponse.json({ items });
}