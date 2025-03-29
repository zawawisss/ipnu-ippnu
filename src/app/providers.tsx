'use client';

import { SessionProvider } from 'next-auth/react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import { HeroUIProvider } from '@heroui/react';
import type { ReactNode } from 'react';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider> {/* ✅ Tambahkan ini */}
      <NextThemesProvider attribute="class" defaultTheme="light" enableSystem>
        <HeroUIProvider>{children}</HeroUIProvider>
      </NextThemesProvider>
    </SessionProvider>
  );
}
