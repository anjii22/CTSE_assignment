import { useQuery } from "@tanstack/react-query";
import { eventService } from "@/api/services";
import { EventCard } from "@/components/EventCard";
import { EventCardSkeleton } from "@/components/Skeletons";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Event } from "@/types";
import { Search, CalendarDays, Sparkles, ArrowRight } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const categories = ["all", "music", "sports", "tech", "arts", "food", "conference", "workshop", "comedy", "other"];
const MAX_EVENTS_ON_HOME = 4;

function parseEventDateTime(e: Event) {
  const date = new Date(e.date);
  if (Number.isNaN(date.getTime())) return null;

  const timeStr = (e.time || "").trim();
  if (!timeStr) {
    // If time is missing/unparseable, assume "end of day" so same-day events still show.
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

  // If parsing fails, treat it as end-of-day to avoid hiding same-day events.
  return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 0, 0);
}

const HomePage = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["events", category],
    queryFn: () => {
      const params: Record<string, string> = {};
      if (category !== "all") params.category = category;
      return eventService.getAll(params);
    },
  });

  const events = data?.data?.events || [];
  const now = new Date();

  // Only show upcoming events (hide passed/ended) in the public listing.
  const upcomingEvents = events.filter((e) => {
    const eventDateTime = parseEventDateTime(e);
    return eventDateTime !== null && eventDateTime > now;
  });

  // Top events preview must be independent of the search input.
  const visibleEvents = upcomingEvents.slice(0, MAX_EVENTS_ON_HOME);

  const goToEvents = () => {
    const q = search.trim();
    navigate(q ? `/events?q=${encodeURIComponent(q)}` : "/events");
  };

  return (
    <div>
      {/* Hero */}
      <section className="gradient-hero py-20 md:py-32">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/20 px-4 py-1.5 text-sm font-medium text-primary-foreground mb-6">
              <Sparkles className="h-4 w-4" />
              Discover Amazing Events
            </div>
            <h1 className="text-4xl md:text-6xl font-extrabold text-primary-foreground mb-6 leading-tight">
              Find & Book
              <span className="text-gradient block">Unforgettable Events</span>
            </h1>
            <p className="text-lg text-primary-foreground/70 mb-8 max-w-xl mx-auto">
              Browse concerts, conferences, workshops and more. Book your spot instantly with secure payments.
            </p>

            {/* Search bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search events or cities..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") goToEvents();
                  }}
                  className="pl-10 bg-card/90 backdrop-blur"
                />
              </div>
              <Button size="lg" type="button" onClick={goToEvents}>
                Explore <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Events */}
      <section className="container mx-auto px-4 py-12">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold">Top Events</h2>
          </div>
          {/* <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat)}
                className="capitalize"
              >
                {cat}
              </Button>
            ))}
          </div> */}
          <div className="ml-auto">
            <a
              href="/events"
              className="inline-flex items-center text-primary hover:underline text-sm font-medium"
            >
              See more events
              <ArrowRight className="ml-1 h-4 w-4" />
            </a>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <EventCardSkeleton key={i} />
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <div className="text-center py-20">
            <CalendarDays className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-semibold">No events found</h3>
            <p className="text-muted-foreground text-sm">Try again later</p>
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
          >
            {visibleEvents.map((event) => (
              <EventCard key={event._id} event={event} />
            ))}
          </motion.div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
