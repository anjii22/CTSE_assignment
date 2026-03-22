import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { eventService } from '../services/eventService';
import { bookingService } from '../services/bookingService';
import { Event } from '../types';
import { EventCard } from '../components/events/EventCard';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Navbar } from '../components/layout/Navbar';
import { Search, Calendar } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { formatMoney, getUserId } from '../utils/format';
import { navigate } from '../components/navigation/history';

export const UserDashboard = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [bookingModal, setBookingModal] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState('');

  const safeEvents = Array.isArray(events) ? events : [];

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const eventsData = await eventService.getAll();
      setEvents(Array.isArray(eventsData) ? eventsData : []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadData();
      return;
    }
    try {
      const results = await eventService.search(searchQuery);
      setEvents(Array.isArray(results) ? results : []);
    } catch (err) {
      console.error('Search failed:', err);
    }
  };

  const handleBookEvent = (event: Event) => {
    if (!user) {
      toast.info('Please sign in to book events.');
      navigate('/login');
      return;
    }
    setSelectedEvent(event);
    setQuantity(1);
    setError('');
    setBookingModal(true);
  };

  const confirmBooking = async () => {
    if (!user || !selectedEvent) return;

    setBookingLoading(true);
    setError('');

    try {
      const userId = getUserId(user);
      if (!userId) {
        throw new Error('Missing user id. Please sign out and sign in again.');
      }
      await bookingService.create({ userId, eventId: selectedEvent._id, quantity });

      setBookingModal(false);
      loadData();
      toast.success('Booking created successfully.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Booking failed');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {user ? `Welcome back, ${user.firstName}!` : 'Events'}
          </h1>
          <p className="text-gray-600">
            {user
              ? 'Discover and book amazing events'
              : 'Browse upcoming events. Sign in to book tickets.'}
          </p>
        </div>
        <div className="mb-6 flex gap-3">
          <Input
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            className="flex-1"
          />
          <Button onClick={handleSearch}>
            <Search size={20} />
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {safeEvents.map((event) => (
            <EventCard
              key={event._id}
              event={event}
              onBook={handleBookEvent}
              bookButtonLabel={user ? 'Book Now' : 'Sign in to book'}
            />
          ))}
        </div>

        {safeEvents.length === 0 && (
          <Card className="p-12 text-center">
            <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
            <p className="text-gray-600">No events found</p>
          </Card>
        )}
      </div>

      <Modal
        isOpen={bookingModal}
        onClose={() => setBookingModal(false)}
        title="Book Event"
      >
        {selectedEvent && (
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">{selectedEvent.title}</h3>
              <p className="text-gray-600">{selectedEvent.description}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Price per ticket:</span>
                <span className="font-semibold">${formatMoney(selectedEvent.price)}</span>
              </div>

              <Input
                type="number"
                label="Quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />

              <div className="flex justify-between text-lg font-bold border-t pt-3">
                <span>Total:</span>
                <span className="text-blue-600">{formatMoney(Number(selectedEvent.price) * quantity)}</span>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1" onClick={() => setBookingModal(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={confirmBooking} loading={bookingLoading}>
                Confirm Booking
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
