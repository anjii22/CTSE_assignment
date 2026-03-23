import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/api/services";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

const AdminBookingsPage = () => {
  // Since we don't have a global bookings endpoint, we show event-level ticket info
  const { data, isLoading } = useQuery({
    queryKey: ["adminEvents"],
    queryFn: () => eventService.getAll(),
  });

  const events = data?.data?.events || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Booking Monitor</h1>
        <p className="text-muted-foreground mt-1">Track ticket sales across all events</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    <th className="text-left p-3 font-medium text-primary">Event</th>
                    <th className="text-left p-3 font-medium text-primary">Date</th>
                    <th className="text-left p-3 font-medium text-primary">Sold</th>
                    <th className="text-left p-3 font-medium text-primary">Available</th>
                    <th className="text-left p-3 font-medium text-primary">Revenue</th>
                    <th className="text-left p-3 font-medium text-primary">Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => {
                    const sold = event.totalTickets - event.availableTickets;
                    const occupancy = event.totalTickets > 0 ? ((sold / event.totalTickets) * 100).toFixed(0) : "0";
                    return (
                      <tr key={event._id} className="border-b hover:bg-muted/30 transition-colors">
                        <td className="p-3 font-medium">{event.title}</td>
                        <td className="p-3 text-muted-foreground">{new Date(event.date).toLocaleDateString()}</td>
                        <td className="p-3">{sold}</td>
                        <td className="p-3">{event.availableTickets}</td>
                        <td className="p-3 font-semibold">${(sold * event.price).toFixed(0)}</td>
                        <td className="p-3">
                          <Badge variant={Number(occupancy) > 80 ? "default" : "secondary"}>
                            {occupancy}%
                          </Badge>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminBookingsPage;
