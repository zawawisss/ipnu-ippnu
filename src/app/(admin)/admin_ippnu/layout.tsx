//layout admin
import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/nextauth";
import { redirect } from "next/navigation";
import { Providers } from "../../providers";
import Sidebar from "../../components/Sidebar";
import "../../globals.css";

export async function checkSession() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }
}

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await checkSession();
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1">{children}</main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
