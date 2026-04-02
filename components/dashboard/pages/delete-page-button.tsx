"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deletePageServer } from "@/lib/pages/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DeletePageButtonProps = {
  pageId: string;
  title: string;
  className?: string;
  /** Grille : icône seule ; liste : libellé optionnel */
  label?: string;
};

export function DeletePageButton({
  pageId,
  title,
  className,
  label,
}: DeletePageButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (
      !window.confirm(
        `Supprimer la page « ${title} » ? Cette action est définitive.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await deletePageServer({ pageId });
      if (res.ok) {
        router.refresh();
      } else {
        window.alert(res.error);
      }
    });
  }

  return (
    <Button
      type="button"
      variant="ghost"
      size={label ? "sm" : "icon-xs"}
      className={cn(
        "text-creo-gray-400 hover:text-red-600 dark:hover:text-red-400",
        className
      )}
      aria-label={`Supprimer la page ${title}`}
      disabled={pending}
      onClick={handleClick}
    >
      <Trash2 className={label ? "size-3.5" : "size-3.5"} />
      {label ? <span>{label}</span> : null}
    </Button>
  );
}
