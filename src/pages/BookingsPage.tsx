import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { bookingService, eventService } from "@/api/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Ticket, XCircle } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Booking, Event } from "@/types";
import { useEffect, useState } from "react";

const statusVariant: Record<string, "default" | "destructive" | "secondary"> = {
  confirmed: "default",
  cancelled: "destructive",
  pending: "secondary",
};

const BookingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [eventMap, setEventMap] = useState<Record<string, Event>>({});

  const { data, isLoading } = useQuery({
    queryKey: ["userBookings", user?.id],
    queryFn: () => bookingService.getUserBookings(user!.id),
    enabled: !!user,
  });

  const bookings = data?.data?.bookings || [];

  // Fetch event details for each booking
  useEffect(() => {
    const eventIds = [...new Set(bookings.map((b) => b.eventId))];
    eventIds.forEach(async (eid) => {
      if (!eventMap[eid]) {
        try {
          const { data } = await eventService.getById(eid);
          setEventMap((prev) => ({ ...prev, [eid]: data }));
        } catch {}
      }
    });
  }, [bookings]);

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => bookingService.cancel(bookingId),
    onSuccess: () => {
      toast.success("Booking cancelled");
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: () => toast.error("Failed to cancel booking"),
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground mt-1">{bookings.length} booking(s)</p>
      </div>

      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <Ticket className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">No bookings yet</h3>
          <p className="text-muted-foreground text-sm">Explore events and make your first booking!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking) => {
            const event = eventMap[booking.eventId];
            return (
              <Card key={booking._id} className="hover:shadow-md transition-shadow animate-fade-in">
                <CardContent className="p-5">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="h-12 w-12 rounded-lg bg-accent flex items-center justify-center shrink-0">
                        <CalendarDays className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{event?.title || "Loading..."}</h3>
                        <div className="flex flex-wrap gap-3 mt-1 text-sm text-muted-foreground">
                          <span>{format(new Date(booking.bookingDate), "MMM dd, yyyy")}</span>
                          <span>•</span>
                          <span>{booking.quantity} ticket(s)</span>
                          <span>•</span>
                          <span className="font-semibold text-foreground">${booking.totalAmount}</span>
                        </div>
                        {event && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {event.venue.name}, {event.venue.city}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant={statusVariant[booking.status] || "secondary"} className="capitalize">
                        {booking.status}
                      </Badge>
                      {booking.status === "confirmed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => cancelMutation.mutate(booking._id)}
                          disabled={cancelMutation.isPending}
                          className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <XCircle className="h-4 w-4 mr-1" /> Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookingsPage;
