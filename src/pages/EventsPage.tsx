import { useQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { eventService } from "@/api/services";
import type { Event } from "@/types";
import { EventCard } from "@/components/EventCard";
import { EventCardSkeleton } from "@/components/Skeletons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, CalendarDays } from "lucide-react";

const categories = ["all", "music", "sports", "tech", "arts", "food", "conference", "workshop", "comedy", "other"];

function parseEventDateTime(e: Event) {
  const date = new Date(e.date);
  if (Number.isNaN(date.getTime())) return null;

  const timeStr = (e.time || "").trim();
  if (!timeStr) {
    // Without a time, assume end of day so events don't disappear.
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 0, 0);
  }

  const match12h = timeStr.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (match12h) {
    let hours = Number.parseInt(match12h[1], 10);
    const minutes = Number.parseInt(match12h[2], 10);
    const ampm = match12h[3].toUpperCase();
    if (ampm === "PM" && hours < 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
  }

  const match24h = timeStr.match(/^(\d{1,2}):(\d{2})$/);
  if (match24h) {
    const hours = Number.parseInt(match24h[1], 10);
    const minutes = Number.parseInt(match24h[2], 10);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes, 0, 0);
  }

  // Fallback: treat as end of day
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 0, 0);
}

const EventsPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const initialQuery = params.get("q") || "";

  const [search, setSearch] = useState(initialQuery);
  useEffect(() => setSearch(initialQuery), [initialQuery]);
  const [category, setCategory] = useState<string>("all");

  const { data, isLoading } = useQuery({
    queryKey: ["events", "all"],
    queryFn: () => eventService.getAll(),
  });

  const events = data?.data?.events || [];

  const now = new Date();

  // Hide ended/passed events and sort by date (newest first).
  const sorted = useMemo(() => {
    const list = events
      .map((e) => {
        const dt = parseEventDateTime(e);
        return dt ? { e, dt } : null;
      })
      .filter((x): x is { e: Event; dt: Date } => x !== null)
      .filter((x) => x.dt.getTime() > now.getTime())
      .sort((a, b) => b.dt.getTime() - a.dt.getTime());

    return list.map((x) => x.e);
  }, [events, now]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const byCategory = category === "all" ? sorted : sorted.filter((e) => e.category === category);

    if (!q) return byCategory;
    return byCategory.filter(
      (e) => e.title.toLowerCase().includes(q) || e.venue.city.toLowerCase().includes(q)
    );
  }, [category, search, sorted]);

  const applySearch = (nextQuery: string) => {
    const q = nextQuery.trim();
    const newParams = new URLSearchParams(location.search);
    if (q) newParams.set("q", q);
    else newParams.delete("q");
    navigate(`/events${newParams.toString() ? `?${newParams.toString()}` : ""}`);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground text-sm mt-1">{filtered.length} events</p>
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <Button
            key={cat}
            variant={category === cat ? "default" : "outline"}
            size="sm"
            type="button"
            onClick={() => setCategory(cat)}
            className="capitalize"
          >
            {cat}
          </Button>
        ))}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-2 ml-auto">
          <div className="flex w-full sm:w-auto gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applySearch(search);
                }}
                placeholder="Search events or cities..."
                className="pl-10 bg-card/90 backdrop-blur"
              />
            </div>
            <Button type="button" onClick={() => applySearch(search)}>
              Search
            </Button>
          </div>
        </div>
      </div>


      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <EventCardSkeleton key={i} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20">
          <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-semibold">No events found</h3>
          <p className="text-muted-foreground text-sm">Try a different search</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filtered.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventsPage;

