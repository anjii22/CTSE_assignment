import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { bookingService, eventService } from "@/api/services";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Ticket, DollarSign, TrendingUp } from "lucide-react";
import { EventCard } from "@/components/EventCard";
import { EventCardSkeleton, StatCardSkeleton } from "@/components/Skeletons";

const DashboardPage = () => {
  const { user } = useAuth();

  const { data: bookingsData } = useQuery({
    queryKey: ["userBookings", user?.id],
    queryFn: () => bookingService.getUserBookings(user!.id),
    enabled: !!user,
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["events"],
    queryFn: () => eventService.getAll(),
  });

  const bookings = bookingsData?.data?.bookings || [];
  const events = eventsData?.data?.events || [];
  const upcomingEvents = events.filter((e) => new Date(e.date) > new Date()).slice(0, 4);

  const confirmedBookings = bookings.filter((b) => b.status === "confirmed");
  const totalSpent = confirmedBookings.reduce((sum, b) => sum + b.totalAmount, 0);

  const stats = [
    { icon: Ticket, label: "Total Bookings", value: bookings.length, color: "text-primary" },
    { icon: CalendarDays, label: "Confirmed", value: confirmedBookings.length, color: "text-success" },
    { icon: DollarSign, label: "Total Spent", value: `$${totalSpent.toFixed(0)}`, color: "text-warning" },
    { icon: TrendingUp, label: "Upcoming Events", value: upcomingEvents.length, color: "text-info" },
  ];

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <Card key={label} className="hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-accent flex items-center justify-center">
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{label}</p>
                  <p className="text-xl font-bold">{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h2 className="text-xl font-bold mb-4">Upcoming Events</h2>
        {eventsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 4 }).map((_, i) => <EventCardSkeleton key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {upcomingEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
