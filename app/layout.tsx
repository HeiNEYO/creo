import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";

import "./globals.css";

import { Providers } from "@/components/providers";
import { cn } from "@/lib/utils";

/** UI : Inter (400–700), corps 14px / 20px via design-system + globals. */
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "CRÉO",
  description:
    "Plateforme SaaS tout-en-un pour infopreneurs, formations et coachs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={cn(
          inter.variable,
          jetbrainsMono.variable,
          "font-sans antialiased",
        )}
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
