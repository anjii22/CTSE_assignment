import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

export const EventCardSkeleton = () => (
  <Card className="overflow-hidden">
    <Skeleton className="h-48 w-full rounded-none" />
    <CardContent className="p-5 space-y-3">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-10 w-full mt-2" />
    </CardContent>
  </Card>
);

export const StatCardSkeleton = () => (
  <Card>
    <CardContent className="p-6 space-y-2">
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-8 w-1/3" />
    </CardContent>
  </Card>
);
