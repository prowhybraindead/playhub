import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 md:grid-cols-2 xl:grid-cols-4 md:px-8">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="rounded-2xl border border-border p-6">
          <Skeleton className="mb-4 h-5 w-1/2" />
          <Skeleton className="h-10 w-3/4" />
        </div>
      ))}
    </div>
  );
}
