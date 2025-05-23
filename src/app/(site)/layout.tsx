// app/layout.tsx

// globals.css includes @tailwind directives
// adjust the path if necessary
import "../globals.css";
import AppFooter from "../components/Footer";
import AppNavbar from "../components/Navbar";
import { Providers } from "../providers";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body>
      <Providers>
        <AppNavbar />
        {children}
        <AppFooter />
      </Providers>
      </body>
    </html>
  );
}
