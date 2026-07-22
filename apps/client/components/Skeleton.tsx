// Skeleton loading primitives. Compose these instead of "Loading..." text.

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-200 dark:bg-gray-700 ${className}`} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
      <Skeleton className="h-48 w-full rounded-none" />
      <div className="p-4 space-y-3">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-9 w-24" />
        </div>
      </div>
    </div>
  );
}

export function ProductGridSkeleton({
  count = 8,
  className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6",
}: {
  count?: number;
  className?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function FarmerGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 space-y-4">
          <Skeleton className="h-20 w-20 rounded-full mx-auto" />
          <Skeleton className="h-5 w-1/2 mx-auto" />
          <Skeleton className="h-4 w-2/3 mx-auto" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  );
}

export function ListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 flex-shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/** Two-column detail page (image + text), e.g. product details. */
export function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Skeleton className="h-96 w-full" />
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-8 w-24" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <div className="flex gap-4 pt-4">
            <Skeleton className="h-12 flex-1" />
            <Skeleton className="h-12 flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Centered panel (avatar + stacked lines), e.g. profile, order summary. */
export function PanelSkeleton() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-6">
      <Skeleton className="h-24 w-24 rounded-full mx-auto" />
      <Skeleton className="h-8 w-1/2 mx-auto" />
      <Skeleton className="h-4 w-1/3 mx-auto" />
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 space-y-4">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-5/6" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-12 w-full" />
      </div>
    </div>
  );
}
