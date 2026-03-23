import { useQuery } from "@tanstack/react-query";
import { eventService, bookingService } from "@/api/services";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays, Users, DollarSign, Ticket } from "lucide-react";
import { StatCardSkeleton } from "@/components/Skeletons";

const AdminDashboardPage = () => {
  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["adminEvents"],
    queryFn: () => eventService.getAll(),
  });

  const events = eventsData?.data?.events || [];
  const totalTickets = events.reduce((sum, e) => sum + e.totalTickets, 0);
  const soldTickets = events.reduce((sum, e) => sum + (e.totalTickets - e.availableTickets), 0);
  const totalRevenue = events.reduce((sum, e) => sum + (e.totalTickets - e.availableTickets) * e.price, 0);

  const stats = [
    { icon: CalendarDays, label: "Total Events", value: events.length, color: "text-primary" },
    { icon: Ticket, label: "Tickets Sold", value: soldTickets, color: "text-info" },
    { icon: DollarSign, label: "Est. Revenue", value: `$${totalRevenue.toFixed(0)}`, color: "text-success" },
    { icon: Users, label: "Total Capacity", value: totalTickets, color: "text-warning" },
  ];

  return (
    <div className="p-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Overview of your event platform</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {eventsLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map(({ icon: Icon, label, value, color }) => (
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

      {/* Recent events table */}
      <Card>
        <CardContent className="p-0">
          <div className="p-4 border-b">
            <h2 className="font-bold text-lg">Recent Events</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left p-3 font-medium text-primary">Title</th>
                  <th className="text-left p-3 font-medium text-primary">Category</th>
                  <th className="text-left p-3 font-medium text-primary">Date</th>
                  <th className="text-left p-3 font-medium text-primary">Price</th>
                  <th className="text-left p-3 font-medium text-primary">Tickets</th>
                  <th className="text-left p-3 font-medium text-primary">Status</th>
                </tr>
              </thead>
              <tbody>
                {events.slice(0, 10).map((event) => (
                  <tr key={event._id} className="border-b hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-medium">{event.title}</td>
                    <td className="p-3 capitalize text-muted-foreground">{event.category}</td>
                    <td className="p-3 text-muted-foreground">{new Date(event.date).toLocaleDateString()}</td>
                    <td className="p-3">${event.price}</td>
                    <td className="p-3">{event.availableTickets}/{event.totalTickets}</td>
                    <td className="p-3 capitalize">{event.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboardPage;
