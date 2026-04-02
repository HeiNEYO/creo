import { cn } from "@/lib/utils";

type PageHeaderProps = {
  title: string;
  description?: string;
  className?: string;
  action?: React.ReactNode;
};

export function PageHeader({
  title,
  description,
  className,
  action,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
        className
      )}
    >
      <div>
        <h1 className="text-creo-2xl font-semibold text-[#202223] dark:text-[#202223]">
          {title}
        </h1>
        {description ? (
          <p className="mt-1 text-creo-base text-[#616161] dark:text-[#616161]">
            {description}
          </p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
