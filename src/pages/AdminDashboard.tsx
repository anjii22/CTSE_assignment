import { useState, useEffect, FormEvent, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { navigate } from '../components/navigation/history';
import { eventService } from '../services/eventService';
import { Event } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { Navbar } from '../components/layout/Navbar';
import { Calendar } from 'lucide-react';
import { useToast } from '../components/ui/Toast';
import { formatDateShort } from '../utils/format';

export const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const toast = useToast();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [showEventModal, setShowEventModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);

  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    price: 0,
    totalTickets: 0,
    venueName: '',
    venueAddress: '',
    venueCity: '',
    venueState: '',
    venueZip: '',
    category: '',
  });

  const loadEvents = async () => {
    setLoading(true);
    try {
      const data = await eventService.getAll();
      setEvents(data);
    } catch (err) {
      console.error('Failed to load events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSubmitting(true);

    try {
      const payload = {
        title: eventForm.title,
        description: eventForm.description,
        organizerId: user._id,
        venue: {
          name: eventForm.venueName,
          address: eventForm.venueAddress,
          city: eventForm.venueCity,
          state: eventForm.venueState,
          zipCode: eventForm.venueZip,
        },
        date: eventForm.date,
        time: eventForm.time,
        totalTickets: eventForm.totalTickets,
        price: eventForm.price,
        category: eventForm.category,
      };

      if (editingEventId) {
        await eventService.update(editingEventId, payload);
      } else {
        await eventService.create(payload);
      }

      setShowEventModal(false);
      setEditingEventId(null);
      loadEvents();
      resetEventForm();
      toast.success(editingEventId ? 'Event updated successfully.' : 'Event created successfully.');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : editingEventId ? 'Failed to update event' : 'Failed to create event');
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateEvent = useCallback(() => {
    setEditingEventId(null);
    resetEventForm();
    setShowEventModal(true);
  }, []);

  const openEditEvent = (event: Event) => {
    setEditingEventId(event._id);
    setEventForm({
      title: event.title || '',
      description: event.description || '',
      date: event.date ? String(event.date).slice(0, 10) : '',
      time: event.time || '',
      price: typeof event.price === 'number' ? event.price : Number(event.price) || 0,
      totalTickets: typeof event.totalTickets === 'number' ? event.totalTickets : Number(event.totalTickets) || 0,
      venueName: event.venue?.name || '',
      venueAddress: event.venue?.address || '',
      venueCity: event.venue?.city || '',
      venueState: event.venue?.state || '',
      venueZip: event.venue?.zipCode || '',
      category: event.category || '',
    });
    setShowEventModal(true);
  };

  useEffect(() => {
    if (!isAdmin) {
      navigate('/dashboard');
      return;
    }

    const params = new URLSearchParams(window.location.search);
    const tab = params.get('tab');
    const action = params.get('action');
    if (action === 'create') {
      if (tab === 'events') openCreateEvent();
    }

    loadEvents();
  }, [isAdmin, openCreateEvent]);

  const resetEventForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      price: 0,
      totalTickets: 0,
      venueName: '',
      venueAddress: '',
      venueCity: '',
      venueState: '',
      venueZip: '',
      category: '',
    });
  };

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Manage events and administrators</p>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading events...</p>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {events.map((event) => (
              <Card key={event._id} className="p-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
                    <p className="text-gray-600 mb-3">{event.description}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <p className="font-medium">{formatDateShort(event.date)}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Time:</span>
                        <p className="font-medium">{event.time}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Price:</span>
                        <p className="font-medium">${event.price}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Tickets:</span>
                        <p className="font-medium">{event.totalTickets}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm" onClick={() => openEditEvent(event)}>
                      Edit
                    </Button>
                  </div>
                </div>
              </Card>
            ))}

            {events.length === 0 && (
              <Card className="p-12 text-center">
                <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600">No events created yet</p>
              </Card>
            )}
          </div>
        )}
      </div>

      <Modal
        isOpen={showEventModal}
        onClose={() => {
          setShowEventModal(false);
          setEditingEventId(null);
          resetEventForm();
        }}
        title={editingEventId ? 'Edit Event' : 'Create New Event'}
        size="xl"
      >
        <form onSubmit={handleCreateEvent} className="space-y-5">
          <Input
            label="Event Title"
            value={eventForm.title}
            onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              rows={4}
              value={eventForm.description}
              onChange={(e) => setEventForm({ ...eventForm, description: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="date"
              label="Date"
              value={eventForm.date}
              onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })}
              required
            />
            <Input
              type="time"
              label="Time"
              value={eventForm.time}
              onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              type="number"
              label="Price ($)"
              min="0"
              step="0.01"
              value={eventForm.price}
              onChange={(e) => setEventForm({ ...eventForm, price: parseFloat(e.target.value) })}
              required
            />
            <Input
              type="number"
              label="Total Tickets"
              min="1"
              value={eventForm.totalTickets}
              onChange={(e) =>
                setEventForm({ ...eventForm, totalTickets: parseInt(e.target.value) })
              }
              required
            />
          </div>

          <Input
            label="Category"
            value={eventForm.category}
            onChange={(e) => setEventForm({ ...eventForm, category: e.target.value })}
            placeholder="e.g., Music, Sports, Technology"
          />

          <div className="border-t pt-5">
            <h3 className="text-lg font-semibold mb-4">Venue Information</h3>
            <div className="space-y-4">
              <Input
                label="Venue Name"
                value={eventForm.venueName}
                onChange={(e) => setEventForm({ ...eventForm, venueName: e.target.value })}
                required
              />
              <Input
                label="Address"
                value={eventForm.venueAddress}
                onChange={(e) => setEventForm({ ...eventForm, venueAddress: e.target.value })}
                required
              />
              <div className="grid grid-cols-3 gap-4">
                <Input
                  label="City"
                  value={eventForm.venueCity}
                  onChange={(e) => setEventForm({ ...eventForm, venueCity: e.target.value })}
                  required
                />
                <Input
                  label="State"
                  value={eventForm.venueState}
                  onChange={(e) => setEventForm({ ...eventForm, venueState: e.target.value })}
                  required
                />
                <Input
                  label="ZIP Code"
                  value={eventForm.venueZip}
                  onChange={(e) => setEventForm({ ...eventForm, venueZip: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setShowEventModal(false);
                resetEventForm();
              }}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" loading={submitting}>
              {editingEventId ? 'Save Changes' : 'Create Event'}
            </Button>
          </div>
        </form>
      </Modal>

      {/*  */}
    </div>
  );
};
