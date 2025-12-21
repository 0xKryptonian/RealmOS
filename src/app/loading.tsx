import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
    return (
        <div className="container mx-auto py-8 space-y-8">
            {/* Hero Skeleton */}
            <div className="w-full h-[300px] rounded-3xl bg-white/5 animate-pulse relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent skeleton-shimmer" />
            </div>

            {/* Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="rounded-xl border border-white/5 p-4 space-y-3 bg-black/20">
                        <Skeleton className="h-[200px] w-full rounded-lg bg-white/5" />
                        <Skeleton className="h-4 w-3/4 bg-white/5" />
                        <Skeleton className="h-3 w-1/2 bg-white/5" />
                        <div className="flex gap-2 pt-2">
                            <Skeleton className="h-8 w-20 rounded-full bg-white/5" />
                            <Skeleton className="h-8 w-20 rounded-full bg-white/5" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
