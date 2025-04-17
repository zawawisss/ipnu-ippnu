// app/(admin)/layout.tsx
import { ReactNode } from "react";
import { Providers } from "../../providers";
import Sidebar from "../../components/admin/Sidebar";
import "../../globals.css";
import { checkSession } from "@/lib/checkSession";
import Navbar from "@/app/components/admin/NavbarAdmin";

export default async function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  await checkSession();

  return (
    <html lang="id" suppressHydrationWarning>
      <body className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Providers>
          <div className="flex h-screen">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Navbar */}

              {/* Content */}
              <main className="flex-1 overflow-y-auto p-4 md:p-6">
                <div className="mx-auto max-w-7xl h-full">{children}</div>
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
