import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-creo-sm border border-transparent px-2 py-0.5 text-creo-xs font-medium",
  {
    variants: {
      variant: {
        purple: "bg-creo-purple-pale text-creo-purple",
        green: "bg-creo-success-pale text-[#059669]",
        orange: "bg-creo-warning-pale text-[#d97706]",
        red: "bg-creo-danger-pale text-[#dc2626]",
        gray: "bg-creo-gray-100 text-[#52525b]",
        blue: "bg-creo-info-pale text-[#2563eb]",
        outline: "border-creo-gray-300 bg-transparent text-creo-gray-700",
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
