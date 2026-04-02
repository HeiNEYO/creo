"use client";

import dynamic from "next/dynamic";

/** Sonner accède à `document` au premier rendu → incompatible SSR Vercel sans dynamic. */
const Toaster = dynamic(
  () => import("sonner").then((mod) => mod.Toaster),
  { ssr: false }
);

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-center" closeButton />
    </>
  );
}
