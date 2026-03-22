import { useEffect, useMemo, useState } from 'react';
import { Navbar } from '../components/layout/Navbar';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useAuth } from '../context/AuthContext';
import { bookingService } from '../services/bookingService';
import { paymentService } from '../services/paymentService';
import { eventService } from '../services/eventService';
import { Payment, Booking, Event } from '../types';
import { HttpError } from '../services/api';
import { useToast } from '../components/ui/Toast';
import { formatDateShort, formatMoney } from '../utils/format';

export const Payments = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [info, setInfo] = useState<string>('');
  const [bookingsById, setBookingsById] = useState<Record<string, Booking>>({});
  const [eventsById, setEventsById] = useState<Record<string, Event>>({});

  const userId = user?._id || '';

  const bookingsTotal = useMemo(() => payments.length, [payments.length]);
  const paymentStatusClasses = (status: Payment['status'] | string) => {
    const s = String(status).toLowerCase();
    if (s === 'completed' || s === 'success' || s === 'paid') return 'bg-green-100 text-green-700';
    if (s === 'failed' || s === 'error') return 'bg-red-100 text-red-700';
    if (s === 'refunded') return 'bg-purple-100 text-purple-700';
    return 'bg-yellow-100 text-yellow-700';
  };

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      setInfo('');
      try {
        const bookings = await bookingService.getUserBookings(userId);
        setBookingsById(Object.fromEntries(bookings.map((b) => [b._id, b])));
        const eventIds = Array.from(
          new Set(
            bookings
              .map((b) => b.event?._id || b.eventId)
              .filter((id): id is string => typeof id === 'string' && id.length > 0)
          )
        );

        if (eventIds.length > 0) {
          const existing = new Set(Object.keys(eventsById));
          const missing = eventIds.filter((id) => !existing.has(id));
          if (missing.length > 0) {
            const eventResults = await Promise.allSettled(missing.map((id) => eventService.getById(id)));
            const next: Record<string, Event> = {};
            eventResults.forEach((r) => {
              if (r.status === 'fulfilled') next[r.value._id] = r.value;
            });
            if (Object.keys(next).length > 0) {
              setEventsById((prev) => ({ ...prev, ...next }));
            }
          }
        }
        const bookingIds = bookings.map((b: Booking) => b._id).filter(Boolean);

        const results = await Promise.allSettled(
          bookingIds.map((id) => paymentService.getByBookingId(id))
        );

        const ok: Payment[] = [];
        const rejected = results.filter((r) => r.status === 'rejected');
        results.forEach((r) => {
          if (r.status === 'fulfilled') ok.push(r.value);
        });

        setPayments(ok);

        if (rejected.length > 0) {
          const first = rejected[0] as PromiseRejectedResult;
          if (first.reason instanceof HttpError && first.reason.status === 403) {
            setInfo('Payment service is not accessible from the frontend (403).');
          } else {
            setInfo('Some payments could not be loaded.');
          }
        }
      } catch (err) {
        if (err instanceof HttpError && err.status === 403) {
          setInfo('Payment service is not accessible from the frontend (403).');
        } else {
          setInfo(err instanceof Error ? err.message : 'Failed to load payments.');
        }
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [userId, eventsById]);

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Payments</h1>
          <p className="text-gray-600">View payments linked to your bookings</p>
        </div>

        {loading ? (
          <Card className="p-8">
            <p className="text-gray-600">Loading payments…</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {info && (
              <Card className="p-6 border-yellow-200 bg-yellow-50">
                <p className="text-yellow-800 text-sm">{info}</p>
              </Card>
            )}

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Payments found</p>
                  <p className="text-2xl font-bold text-gray-900">{bookingsTotal}</p>
                </div>
                <Button
                  variant="secondary"
                  onClick={() => {
                    toast.info('Refreshing…');
                    window.location.reload();
                  }}
                >
                  Refresh
                </Button>
              </div>
            </Card>

            {payments.map((p) => (
              <Card key={p._id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm text-gray-500">Event</p>
                    {(() => {
                      const booking = bookingsById[p.bookingId];
                      const eventId = booking?.event?._id || booking?.eventId || '';
                      const event = (eventId && eventsById[eventId]) || booking?.event;
                      const title = event?.title || (eventId ? `Event ${eventId.slice(-6)}` : '—');
                      const date = event?.date;
                      return (
                        <>
                          <p className="text-lg font-semibold text-gray-900 break-words">{title}</p>
                          <p className="text-sm text-gray-600 mt-1">Date: {formatDateShort(date)}</p>
                        </>
                      );
                    })()}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Amount</p>
                    <p className="text-lg font-bold text-gray-900">${formatMoney(p.amount)}</p>
                    <p
                      className={`text-xs mt-2 px-3 py-1 rounded-full inline-block ${paymentStatusClasses(p.status)}`}
                    >
                      {p.status}
                    </p>
                  </div>
                </div>
              </Card>
            ))}

            {payments.length === 0 && !info && (
              <Card className="p-12 text-center">
                <p className="text-gray-600">No payments found yet.</p>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

