import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted/50", className)}
      {...props}
    />
  );
}

export function MatchCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-border overflow-hidden shadow-sm">
      <div className="bg-gray-50/50 p-3 h-10 flex justify-between items-center">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-20" />
      </div>
      <div className="p-4 flex gap-3">
        <Skeleton className="flex-1 h-16 rounded-lg" />
        <Skeleton className="flex-1 h-16 rounded-lg" />
      </div>
      <div className="p-4 border-t border-border flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-2 w-24" />
        </div>
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

export function LeaderboardSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-4 p-4 bg-white border border-border rounded-xl shadow-sm">
          <Skeleton className="h-6 w-6 rounded-full" />
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-5 w-12" />
        </div>
      ))}
    </div>
  );
}
