import { AuthSplitLayout } from "@/components/auth/auth-split-layout";

export default function InviteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthSplitLayout>{children}</AuthSplitLayout>;
}
