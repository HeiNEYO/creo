import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-creo-sm border border-transparent px-2 py-0.5 text-creo-xs font-medium",
  {
    variants: {
      variant: {
        purple: "bg-creo-purple-pale text-creo-purple",
        green: "bg-creo-success-pale text-emerald-700 dark:text-emerald-300",
        orange: "bg-creo-warning-pale text-amber-800 dark:text-amber-200",
        red: "bg-creo-danger-pale text-red-700 dark:text-red-300",
        gray: "bg-creo-gray-100 text-creo-gray-700 dark:bg-creo-gray-200 dark:text-creo-gray-700",
        blue: "bg-creo-info-pale text-[#0033ff] dark:bg-creo-info-pale dark:text-[#6688ff]",
        outline:
          "border-creo-gray-300 bg-transparent text-creo-gray-700 dark:border-creo-gray-300 dark:text-creo-gray-500",
      },
    },
    defaultVariants: {
      variant: "gray",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
