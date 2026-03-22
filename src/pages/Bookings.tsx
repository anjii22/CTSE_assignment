import { useCallback, useEffect, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Ticket } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import { eventService } from '../services/eventService';
import { Booking, Event } from '../types';
import { HttpError } from '../services/api';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { useToast } from '../components/ui/Toast';
import { formatMoney, formatDateShort, getUserId } from '../utils/format';

export const Bookings = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoadingId, setPaymentLoadingId] = useState<string | null>(null);
  const [payConfirm, setPayConfirm] = useState<{ open: boolean; booking: Booking | null }>({
    open: false,
    booking: null,
  });
  const [cancelConfirm, setCancelConfirm] = useState<{ open: boolean; bookingId: string | null }>({
    open: false,
    bookingId: null,
  });
  const [eventsById, setEventsById] = useState<Record<string, Event>>({});

  const safeBookings = Array.isArray(bookings) ? bookings : [];

  const load = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const bookingsData = await bookingService.getUserBookings(user._id);
      const list = Array.isArray(bookingsData) ? bookingsData : [];
      setBookings(list);

      const eventIds = Array.from(
        new Set(
          list
            .map((b) => b.event?._id || b.eventId)
            .filter((id): id is string => typeof id === 'string' && id.length > 0)
        )
      );
      if (eventIds.length > 0) {
        const results = await Promise.allSettled(eventIds.map((id) => eventService.getById(id)));
        const next: Record<string, Event> = {};
        results.forEach((r) => {
          if (r.status === 'fulfilled') next[r.value._id] = r.value;
        });
        if (Object.keys(next).length > 0) {
          setEventsById((prev) => ({ ...prev, ...next }));
        }
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to load bookings.');
      setBookings([]);
    } finally {
      setLoading(false);
    }
  }, [toast, user?._id]);

  useEffect(() => {
    load();
  }, [load]);

  const handlePayForBooking = (booking: Booking) => {
    if (booking.status === 'cancelled') return;
    setPayConfirm({ open: true, booking });
  };

  const confirmPayForBooking = async () => {
    const booking = payConfirm.booking;
    if (!booking || !user) return;

    const userId = getUserId(user);
    if (!userId) {
      toast.error('Missing user id. Please sign out and sign in again.');
      return;
    }

    setPaymentLoadingId(booking._id);
    try {
      await paymentService.process({
        bookingId: booking._id,
        amount: typeof booking.totalAmount === 'number' ? booking.totalAmount : Number(booking.totalAmount),
        userId,
      });
      await load();
      toast.success('Payment processed successfully.');
    } catch (err) {
      if (err instanceof HttpError && err.status === 403) {
        toast.error('Payment service is not accessible from the frontend (403).');
        return;
      }
      toast.error(err instanceof Error ? err.message : 'Payment failed');
    } finally {
      setPaymentLoadingId(null);
      setPayConfirm({ open: false, booking: null });
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    setCancelConfirm({ open: true, bookingId });
  };

  const confirmCancelBooking = async () => {
    if (!cancelConfirm.bookingId) return;
    try {
      await bookingService.cancel(cancelConfirm.bookingId);
      await load();
      toast.success('Booking cancelled successfully.');
    } catch {
      toast.error('Failed to cancel booking.');
    } finally {
      setCancelConfirm({ open: false, bookingId: null });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Bookings</h1>
          <p className="text-gray-600">Manage your bookings and payments</p>
        </div>

        {loading ? (
          <Card className="p-8">
            <p className="text-gray-600">Loading bookings…</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {safeBookings.map((booking) => {
              const eventId = booking.event?._id || booking.eventId || '';
              const event = (eventId && eventsById[eventId]) || booking.event;
              const eventTitle =
                event?.title || (eventId ? `Event ${eventId.slice(-6)}` : '—');

              return (
              <Card key={booking._id} className="p-6 relative">
                <span
                  className={`absolute top-6 right-6 px-3 py-1 rounded-full text-xs font-medium inline-flex justify-center min-w-24 text-center flex-shrink-0 ${
                    booking.status === 'confirmed'
                      ? 'bg-green-100 text-green-700'
                      : booking.status === 'cancelled'
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}
                >
                  {booking.status}
                </span>

                <div className="pr-32">
                  <h3 className="text-xl font-bold text-blue-800 tracking-tight">
                    {eventTitle}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1 mb-2">
                    Booking #{booking._id.slice(-6)}
                  </p>
                  <p className="text-gray-600 mb-2">Quantity: {booking.quantity}</p>
                  <p className="text-gray-900 font-semibold">Total: ${formatMoney(booking.totalAmount)}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Booked on {formatDateShort(booking.createdAt)}
                  </p>
                </div>

                <div className="absolute bottom-6 right-6 flex flex-row justify-end items-end gap-2">
                  {/* {booking.status !== 'cancelled' && (
                    <Button
                      size="sm"
                      onClick={() => handlePayForBooking(booking)}
                      loading={paymentLoadingId === booking._id}
                    >
                      Pay Now
                    </Button>
                  )} */}
                  {booking.status === 'confirmed' && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleCancelBooking(booking._id)}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </Card>
              );
            })}

            {safeBookings.length === 0 && (
              <Card className="p-12 text-center">
                <Ticket size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No bookings yet</p>
              </Card>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={payConfirm.open}
        onClose={() => setPayConfirm({ open: false, booking: null })}
        title="Confirm payment"
        message={
          payConfirm.booking ? (
            <>
              Pay <span className="font-semibold">${formatMoney(payConfirm.booking.totalAmount)}</span> for this booking?
            </>
          ) : null
        }
        confirmText="Pay now"
        confirmVariant="primary"
        loading={!!payConfirm.booking && paymentLoadingId === payConfirm.booking._id}
        onConfirm={confirmPayForBooking}
      />

      <ConfirmDialog
        isOpen={cancelConfirm.open}
        onClose={() => setCancelConfirm({ open: false, bookingId: null })}
        title="Cancel booking"
        message="Are you sure you want to cancel this booking? This action cannot be undone."
        confirmText="Cancel booking"
        confirmVariant="danger"
        onConfirm={confirmCancelBooking}
      />
    </div>
  );
};

