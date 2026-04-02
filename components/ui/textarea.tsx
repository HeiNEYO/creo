import * as React from "react";

import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          "min-h-[80px] w-full resize-y rounded-creo-md border border-creo-gray-300 bg-creo-white px-3 py-2.5 text-creo-base text-creo-black transition-colors duration-150",
          "placeholder:text-creo-gray-500",
          "focus-visible:border-creo-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--creo-ring-brand)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "dark:border-input dark:bg-background",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
