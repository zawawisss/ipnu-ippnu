// app/layout.tsx

// globals.css includes @tailwind directives
// adjust the path if necessary
import "../app/globals.css";
import {Providers} from "./providers";

export default function RootLayout({children}: { children: React.ReactNode }) {
  return (
    <html lang="en" className='dark'>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}