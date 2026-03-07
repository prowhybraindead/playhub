import { Skeleton } from "@/components/ui/skeleton";

export default function FantasyLoading() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-4 px-4 py-6 md:px-8">
      <Skeleton className="h-32 w-full" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Skeleton key={index} className="h-44 w-full" />
        ))}
      </div>
    </div>
  );
}
