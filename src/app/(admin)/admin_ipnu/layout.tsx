//layout admin
import { ReactNode } from "react";
import { Providers } from "../../providers";
import SidebarIPNU from "../../components/admin/SidebarIPNU";
import "../../globals.css";
import Navbar from "@/app/components/admin/NavbarAdmin";
import { checkAdminSession } from "@/lib/checkAdminSession";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await checkAdminSession(["admin", "ketua", "sekretaris"], "ipnu_");

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="dark:bg-gray-900">
        <Providers>
          {/* Navbar fixed di atas */}
          <Navbar />
          {/* Sidebar fixed di sisi kiri */}
          <SidebarIPNU />
          {/* Konten utama dengan offset */}
          <main className="fixed top-16 left-16 sm:left-64 right-0 bottom-0 p-6 bg-gray-50 dark:bg-gray-900 overflow-y-auto">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
