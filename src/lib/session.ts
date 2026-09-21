import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { getCurrentUserId } from "@/lib/auth";

export const getCurrentUser = cache(async () => {
  const userId = await getCurrentUserId();
  if (!userId) return null;
  const user = await prisma.user.findUnique({ where: { id: userId } });
  return user ? { id: user.id, email: user.email, name: user.name, role: user.role } : null;
});