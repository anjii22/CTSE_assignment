import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/api/services";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { Plus, Edit, Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { useMemo, useState } from "react";

const AdminEventsPage = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["adminEvents"],
    queryFn: () => eventService.getAll(),
  });

  const events = data?.data?.events || [];
  const [search, setSearch] = useState("");

  const filteredEvents = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return events;

    return events.filter((event) => {
      const title = event.title?.toLowerCase() || "";
      const city = event.venue?.city?.toLowerCase() || "";
      const category = event.category?.toLowerCase() || "";
      const status = event.status?.toLowerCase() || "";
      return (
        title.includes(q) ||
        city.includes(q) ||
        category.includes(q) ||
        status.includes(q)
      );
    });
  }, [events, search]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Manage Events</h1>
          <p className="text-muted-foreground mt-1">{filteredEvents.length} events</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search events..."
              className="pl-10 w-64"
            />
          </div>
          <Link to="/admin/events/create">
            <Button><Plus className="h-4 w-4 mr-2" /> Create Event</Button>
          </Link>
        </div>
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
                    <th className="text-left p-3 font-medium text-primary">Venue</th>
                    <th className="text-left p-3 font-medium text-primary">Date</th>
                    <th className="text-left p-3 font-medium text-primary">Price</th>
                    <th className="text-left p-3 font-medium text-primary">Tickets</th>
                    <th className="text-left p-3 font-medium text-primary">Status</th>
                    <th className="text-left p-3 font-medium text-primary">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEvents.map((event) => (
                    <tr key={event._id} className="border-b hover:bg-muted/30 transition-colors">
                      <td className="p-3">
                        <div>
                          <p className="font-medium">{event.title}</p>
                          <p className="text-xs text-muted-foreground capitalize">{event.category}</p>
                        </div>
                      </td>
                      <td className="p-3 text-muted-foreground">{event.venue.name}, {event.venue.city}</td>
                      <td className="p-3 text-muted-foreground">{new Date(event.date).toLocaleDateString()}</td>
                      <td className="p-3">${event.price}</td>
                      <td className="p-3">{event.availableTickets}/{event.totalTickets}</td>
                      <td className="p-3">
                        <Badge variant={event.status === "published" ? "default" : "secondary"} className="capitalize">
                          {event.status}
                        </Badge>
                      </td>
                      <td className="p-3">
                        <Link to={`/admin/events/edit/${event._id}`}>
                          <Button variant="ghost" size="sm"><Edit className="h-4 w-4" /></Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AdminEventsPage;
