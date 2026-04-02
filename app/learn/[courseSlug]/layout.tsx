import Link from "next/link";

import { SignOutButton } from "@/components/auth/sign-out-button";

export default function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-creo-white">
      <header className="flex h-[60px] items-center justify-between gap-4 border-b border-creo-gray-200 px-4 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <span className="text-creo-sm font-semibold text-creo-purple">
            Ton logo
          </span>
          <span className="hidden text-creo-sm text-creo-gray-500 sm:inline">
            · Formation démo
          </span>
        </div>
        <div className="hidden max-w-xs flex-1 px-4 md:block">
          <div className="h-2 overflow-hidden rounded-full bg-creo-gray-100">
            <div
              className="h-full w-[35%] rounded-full bg-creo-purple"
              aria-hidden
            />
          </div>
          <p className="mt-1 text-center text-creo-xs text-creo-gray-500">
            35 % complété
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/dashboard"
            className="text-creo-xs text-creo-gray-500 hover:text-creo-purple md:text-creo-sm"
          >
            Dashboard créateur
          </Link>
          <SignOutButton />
        </div>
      </header>
      <div className="flex min-h-[calc(100vh-60px)]">{children}</div>
    </div>
  );
}
