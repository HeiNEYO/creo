import { EmailCrmSubnav } from "@/components/dashboard/email-crm/email-crm-subnav";

export default function EmailCrmLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <EmailCrmSubnav />
      {children}
    </>
  );
}
