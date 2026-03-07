import { Skeleton } from "@/components/ui/skeleton";

export default function UpgradeLoading() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 md:grid-cols-2 md:px-8">
      <Skeleton className="h-[420px] w-full" />
      <Skeleton className="h-[420px] w-full" />
    </div>
  );
}
