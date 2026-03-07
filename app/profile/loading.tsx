import { Skeleton } from "@/components/ui/skeleton";

export default function ProfileLoading() {
  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6 md:px-8">
      <Skeleton className="h-12 w-1/3" />
      <Skeleton className="h-72 w-full" />
    </div>
  );
}
