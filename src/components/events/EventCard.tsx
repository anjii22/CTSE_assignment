import { Event } from '../../types';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { MapPin, Calendar as CalendarIcon, Clock, DollarSign } from 'lucide-react';

interface EventCardProps {
  event: Event;
  onBook?: (event: Event) => void;
  onViewDetails?: (event: Event) => void;
  /** Defaults to "Book Now" */
  bookButtonLabel?: string;
}

export const EventCard = ({ event, onBook, onViewDetails, bookButtonLabel = 'Book Now' }: EventCardProps) => {
  const formatDate = (dateStr: unknown) => {
    if (!dateStr) return '—';
    const d = new Date(String(dateStr));
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatMoney = (value: unknown) => {
    const n = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(n) ? n.toFixed(2) : '0.00';
  };

  return (
    <Card hover className="overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
        <CalendarIcon size={48} className="text-white opacity-50" />
      </div>

      <div className="p-5">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{event.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-2 mb-4">{event.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <CalendarIcon size={16} className="text-gray-400" />
            <span>{formatDate(event.date)}</span>
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Clock size={16} className="text-gray-400" />
            <span>{event.time}</span>
          </div>

          {event.venue?.name && (
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <MapPin size={16} className="text-gray-400" />
              <span className="line-clamp-1">{event.venue.name}</span>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm font-semibold text-blue-600">
            <DollarSign size={16} />
            <span>${formatMoney(event.price)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {onViewDetails && (
            <Button variant="secondary" size="sm" onClick={() => onViewDetails(event)} className="flex-1">
              View Details
            </Button>
          )}
          {onBook && (
            <Button size="sm" onClick={() => onBook(event)} className="flex-1">
              {bookButtonLabel}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
};
