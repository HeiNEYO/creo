import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 min-h-9 w-full rounded-creo-md border border-creo-gray-300 bg-creo-white px-3 text-creo-base text-creo-black transition-colors duration-150",
          "placeholder:text-creo-gray-500",
          "focus-visible:border-creo-purple focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--creo-ring-brand)]",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "dark:border-input dark:bg-background",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Input.displayName = "Input";

export { Input };
