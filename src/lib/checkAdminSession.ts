//lib/checkAdminSession.ts
import { authOptions } from "@/nextauth";
import { getServerSession } from "next-auth/next";

export async function checkAdminSession() {
  const session = await getServerSession(authOptions); // Hapus req, res
  return session;
}

export async function checkAdminSessionServer(
  allowedRoles: string[],
  orgPrefix?: string
) {
  const session = await getServerSession(authOptions);


  if (
    !session ||
    !session.user ||
    !session.user.role ||
    !session.user.name ||
    !allowedRoles.includes(session.user.role)
  ) {
    return null; // Return null instead of redirecting
  }

  // Extract org from session.user.name
  const nameParts = session.user.name.split("_");
  const org = nameParts[0];

  if (orgPrefix && org !== orgPrefix) {
    return null;
  }

  return session;
}
