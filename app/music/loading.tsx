import { Skeleton } from "@/components/ui/skeleton";

export default function MusicLoading() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[1fr_350px] md:px-8">
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={index} className="h-56 w-full" />
          ))}
        </div>
      </div>
      <Skeleton className="h-[500px] w-full" />
    </div>
  );
}
