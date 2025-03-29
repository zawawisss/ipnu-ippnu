// src/lib/checkSession.ts
import { getServerSession } from "next-auth";

export const checkSession = async () => {
  const session = await getServerSession();
  return session;
};
