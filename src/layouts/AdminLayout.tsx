import { Outlet, Link, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "@/components/Navbar";
import {
  LayoutDashboard, CalendarDays, Users, BookOpen, Plus, ChevronLeft, ChevronRight, LogOut
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const adminLinks = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { to: "/admin/events", label: "Events", icon: CalendarDays },
  { to: "/admin/events/create", label: "Create Event", icon: Plus },
  { to: "/admin/users", label: "Add Users", icon: Users },
  { to: "/admin/bookings", label: "Bookings", icon: BookOpen },
];

export const AdminLayout = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  // Highlight only the most specific sidebar item that matches the current route.
  // Example: for `/admin/events/create`, only `/admin/events/create` should be active
  // (not `/admin` or `/admin/events`).
  const activeTo = adminLinks
    .filter(({ to }) => pathname === to || pathname.startsWith(`${to}/`))
    .sort((a, b) => b.to.length - a.to.length)[0]?.to;

  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <Navbar />
      {/* Constrain height so the sidebar doesn't move/page-scroll */}
      <div className="flex flex-1 min-h-0 h-[calc(100vh-4rem)]">
        <aside className={cn(
          "hidden md:flex flex-col border-r bg-sidebar transition-all duration-300 overflow-hidden min-h-0",
          collapsed ? "w-16" : "w-60"
        )}>
          <div className="flex items-center justify-between p-3 border-b border-sidebar-border">
            {!collapsed && <span className="text-sm font-semibold text-sidebar-foreground">Admin Panel</span>}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="p-1 rounded hover:bg-sidebar-accent text-sidebar-foreground"
            >
              {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>
          <nav className="flex-1 p-2 space-y-1 overflow-hidden">
            {adminLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors transition-transform duration-200 ease-in-out",
                  to === activeTo
                    ? "bg-sidebar-primary text-sidebar-primary-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{label}</span>}
              </Link>
            ))}
          </nav>
          <div className="p-2 border-t border-sidebar-border">
            <Button
              variant="ghost"
              className="w-full justify-start text-sidebar-foreground hover:bg-red-50 hover:text-red-700"
              onClick={() => setLogoutConfirmOpen(true)}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {!collapsed && "Log out"}
            </Button>
          </div>
        </aside>

        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

      <AlertDialog open={logoutConfirmOpen} onOpenChange={setLogoutConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm logout</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                setLogoutConfirmOpen(false);
                logout();
                navigate("/");
              }}
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
