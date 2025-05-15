import { getServerSession } from "next-auth/next";
import { authOptions } from "@/nextauth";
import { redirect } from "next/navigation";

export async function checkAdminSession(allowedRoles: string[], orgPrefix: string) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.role || !session.user.name || !allowedRoles.includes(session.user.role) || !session.user.name.startsWith(orgPrefix)) {
    redirect("/login");
  }

  return session;
}
