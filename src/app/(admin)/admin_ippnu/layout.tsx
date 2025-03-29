//layout admin
import { ReactNode } from "react";
import { Providers } from "../../providers";
import Sidebar from "../../components/Sidebar";
import "../../globals.css";
import { checkSession } from "@/lib/checkSession";


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
