import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { bookingService, eventService, paymentService } from "@/api/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Ticket, XCircle, CreditCard } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import type { Booking, Event } from "@/types";
import { useEffect, useState } from "react";

const statusVariant: Record<string, "default" | "destructive" | "secondary"> = {
  confirmed: "default",
  cancelled: "destructive",
  pending: "secondary",
};

const PAYMENT_METHODS = [
  { value: "card", label: "Credit / debit card" },
  { value: "digital_wallet", label: "Digital wallet" },
  { value: "bank_transfer", label: "Bank transfer" },
] as const;

/** Booking ids the user has successfully paid for in this browser (avoids hiding Pay based on unreliable GET /payments/booking). */
const PAID_BOOKINGS_STORAGE_KEY = "em_booking_paid_ids";

function readPaidBookingIds(): Set<string> {
  if (typeof sessionStorage === "undefined") return new Set();
  try {
    const raw = sessionStorage.getItem(PAID_BOOKINGS_STORAGE_KEY);
    if (!raw) return new Set();
    const ids = JSON.parse(raw) as unknown;
    if (!Array.isArray(ids)) return new Set();
    return new Set(ids.filter((x): x is string => typeof x === "string" && x.length > 0));
  } catch {
    return new Set();
  }
}

function persistPaidBookingIds(ids: Set<string>) {
  sessionStorage.setItem(PAID_BOOKINGS_STORAGE_KEY, JSON.stringify([...ids]));
}

function normalizeStatus(status: string | undefined): string {
  return (status ?? "").toLowerCase();
}

function getBookingId(booking: Booking): string {
  const raw = booking._id ?? booking.id;
  return raw != null ? String(raw) : "";
}

const BookingsPage = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [eventMap, setEventMap] = useState<Record<string, Event>>({});
  const [payBooking, setPayBooking] = useState<Booking | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("card");
  const [paidBookingIds, setPaidBookingIds] = useState<Set<string>>(readPaidBookingIds);

  const { data, isLoading } = useQuery({
    queryKey: ["userBookings", user?.id],
    queryFn: () => bookingService.getUserBookings(user!.id),
    enabled: !!user,
  });

  const bookings = data?.data?.bookings ?? [];

  useEffect(() => {
    const eventIds = [...new Set(bookings.map((b) => b.eventId))];
    eventIds.forEach(async (eid) => {
      if (!eventMap[eid]) {
        try {
          const { data: ev } = await eventService.getById(eid);
          setEventMap((prev) => ({ ...prev, [eid]: ev }));
        } catch {
          /* ignore */
        }
      }
    });
  }, [bookings]);

  const cancelMutation = useMutation({
    mutationFn: (bookingId: string) => bookingService.cancel(bookingId),
    onSuccess: (_data, bookingId) => {
      toast.success("Booking cancelled");
      setPaidBookingIds((prev) => {
        if (!bookingId || !prev.has(bookingId)) return prev;
        const next = new Set(prev);
        next.delete(bookingId);
        persistPaidBookingIds(next);
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
    },
    onError: () => toast.error("Failed to cancel booking"),
  });

  const payMutation = useMutation({
    mutationFn: async (booking: Booking) => {
      const bid = getBookingId(booking);
      const { data: payment } = await paymentService.process({
        bookingId: bid,
        userId: user!.id,
        amount: booking.totalAmount,
        paymentMethod,
      });
      try {
        await bookingService.confirm(bid);
      } catch {
        /* booking may already be confirmed by payment endpoint */
      }
      return payment;
    },
    onSuccess: (_data, booking) => {
      const wasConfirmed = normalizeStatus(booking.status) === "confirmed";
      toast.success(
        wasConfirmed ? "Payment recorded successfully" : "Payment successful — your booking is confirmed",
      );
      const bid = getBookingId(booking);
      if (bid) {
        setPaidBookingIds((prev) => {
          const next = new Set(prev);
          next.add(bid);
          persistPaidBookingIds(next);
          return next;
        });
      }
      setPayBooking(null);
      queryClient.invalidateQueries({ queryKey: ["userBookings"] });
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
    onError: (err: { response?: { data?: { message?: string } } }) => {
      toast.error(err.response?.data?.message || "Payment failed");
    },
  });

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Bookings</h1>
        <p className="text-muted-foreground mt-1">{bookings.length} booking(s)</p>
      </div>

      <Dialog
        open={!!payBooking}
        onOpenChange={(open) => {
          if (!open) setPayBooking(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Pay for booking
            </DialogTitle>
            <DialogDescription>
              {payBooking && eventMap[payBooking.eventId] && (
                <>
                  {eventMap[payBooking.eventId]!.title} — {payBooking.quantity} ticket(s)
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {payBooking && (
            <div className="space-y-4 py-2">
              <div className="rounded-lg border bg-muted/40 px-4 py-3 flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Total due</span>
                <span className="text-xl font-bold">${Number(payBooking.totalAmount).toFixed(2)}</span>
              </div>
              <div className="space-y-2">
                <Label htmlFor="payment-method">Payment method</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="payment-method">
                    <SelectValue placeholder="Choose method" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAYMENT_METHODS.map((m) => (
                      <SelectItem key={m.value} value={m.value}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setPayBooking(null)} disabled={payMutation.isPending}>
              Cancel
            </Button>
            <Button
              onClick={() => payBooking && payMutation.mutate(payBooking)}
              disabled={!payBooking || payMutation.isPending}
            >
              {payMutation.isPending ? "Processing…" : "Pay now"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {bookings.length === 0 ? (
        <div className="text-center py-20">
          <Ticket className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">No bookings yet</h3>
          <p className="text-muted-foreground text-sm">Explore events and make your first booking!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bookings.map((booking, index) => {
            const event = eventMap[booking.eventId];
            const bookingId = getBookingId(booking);
            const st = normalizeStatus(booking.status);
            const isCancelled = st === "cancelled";
            const paidInApp = bookingId ? paidBookingIds.has(bookingId) : false;
            const showPay = !isCancelled && !paidInApp;

            return (
              <Card
                key={bookingId || `row-${index}`}
                className="hover:shadow-md transition-shadow animate-fade-in"
              >
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

                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant={statusVariant[st] || "secondary"} className="capitalize">
                        {booking.status}
                      </Badge>
                      {!isCancelled && (
                        <>
                          {showPay && (
                            <Button
                              size="sm"
                              onClick={() => setPayBooking(booking)}
                              disabled={!bookingId}
                              className="gap-1.5"
                            >
                              <CreditCard className="h-4 w-4" />
                              Pay now
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => bookingId && cancelMutation.mutate(bookingId)}
                            disabled={cancelMutation.isPending || !bookingId}
                            className={
                              paidInApp
                                ? "text-destructive border-destructive/30 hover:bg-destructive/10"
                                : "text-muted-foreground"
                            }
                          >
                            <XCircle className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                        </>
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
