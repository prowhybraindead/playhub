import { Skeleton } from "@/components/ui/skeleton";

export default function ChatLoading() {
  return (
    <div className="mx-auto grid w-full max-w-7xl gap-4 px-4 py-6 lg:grid-cols-[1fr_280px] md:px-8">
      <Skeleton className="h-[70vh] w-full" />
      <Skeleton className="h-[70vh] w-full" />
    </div>
  );
}
