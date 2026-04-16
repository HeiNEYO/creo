import { cn } from "@/lib/utils";

/** Wordmark Stripe (typographie officielle : minuscules, violet #635BFF). */
export function StripeWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-block font-semibold text-[1.35rem] lowercase leading-none tracking-tight text-[#635BFF]",
        className
      )}
      aria-label="Stripe"
    >
      stripe
    </span>
  );
}

/** Wordmark PayPal (bicolore officiel). */
export function PayPalWordmark({ className }: { className?: string }) {
  return (
    <span
      className={cn("inline-flex items-baseline font-bold text-[1.35rem] leading-none tracking-tight", className)}
      aria-label="PayPal"
    >
      <span className="text-[#003087]">Pay</span>
      <span className="text-[#009CDE]">Pal</span>
    </span>
  );
}
