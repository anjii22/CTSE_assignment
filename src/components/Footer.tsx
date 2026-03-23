import { CalendarDays } from "lucide-react";
import { Link } from "react-router-dom";

export const Footer = () => (
  <footer className="border-t bg-card mt-auto">
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <CalendarDays className="h-5 w-5 text-primary" />
          <span className="text-gradient">EventHub</span>
        </Link>
        <div className="flex gap-6 text-sm text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Events</Link>
          <a href="#" className="hover:text-foreground transition-colors">About</a>
          <a href="#" className="hover:text-foreground transition-colors">Support</a>
        </div>
        <p className="text-sm text-muted-foreground">© 2026 EventHub. All rights reserved.</p>
      </div>
    </div>
  </footer>
);
