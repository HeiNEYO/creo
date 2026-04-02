import * as React from "react";

import { cn } from "@/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

const Label = React.forwardRef<HTMLLabelElement, LabelProps>(
  ({ className, ...props }, ref) => (
    <label
      ref={ref}
      className={cn(
        "text-creo-base font-medium leading-none text-creo-black peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-foreground",
        className
      )}
      {...props}
    />
  )
);
Label.displayName = "Label";

export { Label };
