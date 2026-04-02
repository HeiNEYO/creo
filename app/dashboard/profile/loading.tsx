import { Card } from "@/components/ui/card";

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-creo-gray-100 dark:bg-muted/40" />
      <Card className="h-64 animate-pulse bg-creo-gray-50 dark:bg-muted/20" />
    </div>
  );
}
