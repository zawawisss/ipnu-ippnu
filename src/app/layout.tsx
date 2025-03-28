// app/layout.tsx

// globals.css includes @tailwind directives
// adjust the path if necessary
import "../app/globals.css";
import AppFooter from "./components/Footer";
import AppNavbar from "./components/Navbar";
import {Providers} from "./providers";


export default function RootLayout({children}: { children: React.ReactNode }) {
  return (
    <html lang="en" className='dark' >
      <body className="h-full min-h-screen">
        <Providers>
          {children}
        </Providers>
        <AppFooter />
      </body>
    </html>
  );
}