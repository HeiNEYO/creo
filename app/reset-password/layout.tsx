import { AuthShell } from "@/components/auth/auth-shell";

export default function ResetPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AuthShell>{children}</AuthShell>;
}
