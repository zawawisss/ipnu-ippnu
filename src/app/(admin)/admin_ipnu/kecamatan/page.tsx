import { authOptions } from "@/nextauth";
import { getServerSession } from "next-auth";
import AdminContent from "./components/content";
import { redirect, RedirectType } from "next/navigation";

export default async function AdminWrapper() {
  const session = await getServerSession(authOptions);
   if (!session) {
      redirect("/login");
    }

  return <AdminContent />;
}