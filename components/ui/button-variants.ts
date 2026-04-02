import { cva, type VariantProps } from "class-variance-authority";

/** Variants CRÉO : primary / secondary / ghost / danger + tailles sm | md (default) | lg */
export const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-creo-md border border-transparent bg-clip-padding font-medium whitespace-nowrap outline-none select-none transition-all duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--creo-ring-brand)] focus-visible:ring-offset-0 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 gap-1.5 active:not-aria-[haspopup]:translate-y-0",
  {
    variants: {
      variant: {
        default:
          "bg-creo-purple text-white hover:bg-creo-purple-light enabled:hover:-translate-y-px",
        outline:
          "border-creo-gray-300 bg-creo-white text-creo-black hover:border-creo-gray-400 hover:bg-creo-gray-50 dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
        secondary:
          "border-creo-gray-300 bg-creo-white text-creo-black hover:bg-creo-gray-50 hover:border-creo-gray-400 dark:border-input dark:bg-secondary dark:text-secondary-foreground dark:hover:bg-secondary/80",
        ghost:
          "text-creo-gray-700 hover:bg-creo-gray-100 border-transparent dark:text-foreground dark:hover:bg-muted/50",
        danger:
          "bg-creo-danger text-white hover:bg-creo-danger/90 enabled:hover:-translate-y-px",
        destructive:
          "bg-creo-danger-pale text-[#dc2626] hover:bg-red-100 border-transparent dark:bg-destructive/20",
        link: "border-transparent text-creo-purple underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 min-h-9 px-4 text-creo-base",
        sm: "h-8 min-h-8 px-3 text-creo-sm",
        lg: "h-10 min-h-10 px-5 text-creo-md",
        xs: "h-7 min-h-7 gap-1 px-2.5 text-creo-sm rounded-creo-sm",
        icon: "size-9",
        "icon-xs": "size-7 rounded-creo-sm",
        "icon-sm": "size-8",
        "icon-lg": "size-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export type ButtonVariantProps = VariantProps<typeof buttonVariants>;
