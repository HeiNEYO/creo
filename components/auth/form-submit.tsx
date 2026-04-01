"use client";

import { useFormStatus } from "react-dom";

import { Button } from "@/components/ui/button";

type FormSubmitProps = {
  label: string;
  pendingLabel?: string;
};

export function FormSubmit({ label, pendingLabel = "Patienter…" }: FormSubmitProps) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending} size="lg">
      {pending ? pendingLabel : label}
    </Button>
  );
}
