import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { eventService, bookingService } from "@/api/services";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, MapPin, Clock, Ticket, ArrowLeft, Minus, Plus } from "lucide-react";
import { format } from "date-fns";
import { useState } from "react";
import { toast } from "sonner";

const EventDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [quantity, setQuantity] = useState(1);

  const { data: event, isLoading } = useQuery({
    queryKey: ["event", id],
    queryFn: () => eventService.getById(id!),
    enabled: !!id,
    select: (res) => res.data,
  });

  const bookMutation = useMutation({
    mutationFn: () =>
      bookingService.create({
        userId: user!.id,
        eventId: id!,
        quantity,
      }),
    onSuccess: (res) => {
      toast.success("Booking confirmed! Payment processed automatically.");
      queryClient.invalidateQueries({ queryKey: ["events"] });
      navigate("/bookings");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Booking failed");
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!event) return <div className="text-center py-20">Event not found</div>;

  const isPast = new Date(event.date) < new Date();
  const soldOut = event.availableTickets <= 0;
  const total = quantity * event.price;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-6">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Event Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative h-64 md:h-80 rounded-xl gradient-hero flex items-center justify-center overflow-hidden">
            {event.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
            ) : (
              <CalendarDays className="h-24 w-24 text-primary/20" />
            )}
            <Badge className="absolute top-4 left-4 capitalize">{event.category}</Badge>
          </div>

          <div>
            <h1 className="text-3xl font-extrabold mb-2">{event.title}</h1>
            <p className="text-muted-foreground leading-relaxed">{event.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: CalendarDays, label: "Date", value: format(new Date(event.date), "EEEE, MMM dd, yyyy") },
              { icon: Clock, label: "Time", value: event.time },
              { icon: MapPin, label: "Venue", value: `${event.venue.name}, ${event.venue.address}, ${event.venue.city}` },
              { icon: Ticket, label: "Availability", value: `${event.availableTickets} of ${event.totalTickets} tickets` },
            ].map(({ icon: Icon, label, value }) => (
              <Card key={label}>
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-sm font-semibold">{value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Booking Card */}
        <div>
          <Card className="sticky top-24">
            <CardContent className="p-6 space-y-6">
              <div className="text-center">
                <p className="text-sm text-muted-foreground">Price per ticket</p>
                <p className="text-4xl font-extrabold text-primary">${event.price}</p>
              </div>

              {!isPast && !soldOut && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Quantity</label>
                    <div className="flex items-center gap-3">
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <Input
                        type="number"
                        value={quantity}
                        onChange={(e) => setQuantity(Math.max(1, Math.min(event.availableTickets, +e.target.value || 1)))}
                        className="text-center w-20"
                        min={1}
                        max={event.availableTickets}
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setQuantity(Math.min(event.availableTickets, quantity + 1))}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-muted-foreground">{quantity} × ${event.price}</span>
                      <span className="font-bold">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  {isAuthenticated ? (
                    <Button
                      className="w-full"
                      size="lg"
                      onClick={() => bookMutation.mutate()}
                      disabled={bookMutation.isPending}
                    >
                      {bookMutation.isPending ? "Processing..." : `Book Now — $${total.toFixed(2)}`}
                    </Button>
                  ) : (
                    <Button className="w-full" size="lg" onClick={() => navigate("/login")}>
                      Login to Book
                    </Button>
                  )}
                  <p className="text-xs text-muted-foreground text-center">
                    Payment is processed automatically upon booking
                  </p>
                </>
              )}

              {soldOut && (
                <div className="text-center py-4">
                  <Badge variant="destructive" className="text-lg px-4 py-1">Sold Out</Badge>
                </div>
              )}
              {isPast && (
                <div className="text-center py-4">
                  <Badge variant="secondary" className="text-lg px-4 py-1">Event Ended</Badge>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default EventDetailPage;
