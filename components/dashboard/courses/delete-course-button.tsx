"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { deleteCourseServer } from "@/lib/courses/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type DeleteCourseButtonProps = {
  courseId: string;
  title: string;
  className?: string;
  label?: string;
};

export function DeleteCourseButton({
  courseId,
  title,
  className,
  label,
}: DeleteCourseButtonProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (
      !window.confirm(
        `Supprimer la formation « ${title} » ? Les modules et leçons seront supprimés. Cette action est définitive.`
      )
    ) {
      return;
    }
    startTransition(async () => {
      const res = await deleteCourseServer({ courseId });
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
      aria-label={`Supprimer la formation ${title}`}
      disabled={pending}
      onClick={handleClick}
    >
      <Trash2 className="size-3.5 shrink-0" />
      {label ? <span>{label}</span> : null}
    </Button>
  );
}
