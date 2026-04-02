export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse bg-stone-200 dark:bg-[#222] rounded-lg ${className}`} />;
}

export function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-[#1a1a1a] rounded-[var(--radius-md)] shadow-sm p-5 border border-stone-100 dark:border-[#333]">
      <Skeleton className="h-4 w-2/3 mb-3" />
      <Skeleton className="h-3 w-full mb-2" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  );
}

export function GridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => <CardSkeleton key={i} />)}
    </div>
  );
}
