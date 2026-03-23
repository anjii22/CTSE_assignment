import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, MapPin, Clock, Ticket } from "lucide-react";
import type { Event } from "@/types";
import { Link } from "react-router-dom";
import { format } from "date-fns";

const categoryColors: Record<string, string> = {
  music: "bg-primary/10 text-primary",
  sports: "bg-info/10 text-info",
  tech: "bg-accent text-accent-foreground",
  arts: "bg-warning/10 text-warning",
  food: "bg-destructive/10 text-destructive",
};

export const EventCard = ({ event }: { event: Event }) => {
  const isPast = new Date(event.date) < new Date();
  const soldOut = event.availableTickets <= 0;

  return (
    <Card className="group overflow-hidden border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-48 gradient-hero flex items-center justify-center overflow-hidden">
        {event.imageUrl ? (
          <img src={event.imageUrl} alt={event.title} className="w-full h-full object-cover" />
        ) : (
          <CalendarDays className="h-16 w-16 text-primary/30" />
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          <Badge className={categoryColors[event.category] || "bg-muted text-muted-foreground"}>
            {event.category}
          </Badge>
          {soldOut && <Badge variant="destructive">Sold Out</Badge>}
          {isPast && <Badge variant="secondary">Past</Badge>}
        </div>
        <div className="absolute top-3 right-3 bg-card/90 backdrop-blur rounded-lg px-3 py-1">
          <span className="font-bold text-primary">${event.price}</span>
        </div>
      </div>
      <CardContent className="p-5 space-y-3">
        <h3 className="font-bold text-lg line-clamp-1 group-hover:text-primary transition-colors">
          {event.title}
        </h3>
        <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary" />
            <span>{format(new Date(event.date), "MMM dd, yyyy")}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <span>{event.time}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-primary" />
            <span>{event.venue.name}, {event.venue.city}</span>
          </div>
          <div className="flex items-center gap-2">
            <Ticket className="h-4 w-4 text-primary" />
            <span>{event.availableTickets} / {event.totalTickets} available</span>
          </div>
        </div>
        <Link to={`/events/${event._id}`}>
          <Button className="w-full mt-2" size="sm" disabled={soldOut || isPast}>
            {soldOut ? "Sold Out" : isPast ? "Event Ended" : "View Details"}
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};
