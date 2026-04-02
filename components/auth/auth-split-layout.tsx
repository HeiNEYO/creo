import Link from "next/link";

import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel";

export function AuthSplitLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="hidden lg:block">
        <AuthMarketingPanel />
      </div>
      <div className="flex flex-col bg-creo-white">
        <div className="border-b border-creo-gray-200 px-6 py-4 lg:hidden">
          <Link
            href="/"
            className="text-lg font-medium tracking-tight text-creo-purple"
          >
            CRÉO
          </Link>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <Link
              href="/"
              className="mb-8 hidden text-lg font-medium text-creo-purple lg:inline-block"
            >
              CRÉO
            </Link>
            {children}
            <p className="mt-10 text-center text-creo-xs text-creo-gray-400 lg:text-left">
              En continuant, tu acceptes nos conditions et notre politique de
              confidentialité.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
