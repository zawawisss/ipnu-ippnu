import { getServerSession } from "next-auth/next";
import { authOptions } from "@/nextauth";

export async function checkAdminSession(allowedRoles: string[], orgPrefix: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.role || !session.user.name || !allowedRoles.includes(session.user.role) || !session.user.name.startsWith(orgPrefix)) {
    return null; // Return null instead of redirecting
  }

  return session;
}
