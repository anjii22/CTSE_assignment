import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Menu, X, CalendarDays, LogOut, User, LayoutDashboard, BookOpen } from "lucide-react";
import { useState } from "react";
import { NavLink } from "@/components/NavLink";
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

export const Navbar = () => {
  const { isAuthenticated, isAdmin, user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [logoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  const requestLogout = () => {
    setUserMenuOpen(false);
    setMobileOpen(false);
    setLogoutConfirmOpen(true);
  };

  const dashboardTo = isAdmin ? "/admin" : "/dashboard";

  return (
    <nav className="sticky top-0 z-50 border-b bg-card/80 backdrop-blur-lg">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 relative">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl">
          <CalendarDays className="h-6 w-6 text-primary" />
          <span className="text-gradient">EventHub</span>
        </Link>

        {/* Desktop centered links */}
        <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
          <NavLink
            to="/"
            className="text-sm font-medium text-muted-foreground transition-all duration-200 ease-in-out transform-gpu px-2 py-1 rounded-md hover:bg-green-50 hover:text-green-700 hover:scale-[1.03]"
            activeClassName="text-green-600 font-semibold text-[15px] underline underline-offset-4"
          >
            Home
          </NavLink>
          <NavLink
            to="/events"
            className="text-sm font-medium text-muted-foreground transition-all duration-200 ease-in-out transform-gpu px-2 py-1 rounded-md hover:bg-green-50 hover:text-green-700 hover:scale-[1.03]"
            activeClassName="text-green-600 font-semibold text-[15px] underline underline-offset-4"
          >
            Events
          </NavLink>
        </div>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-6 ml-auto">
          {isAuthenticated ? (
            <>
              <div className="relative flex items-center gap-3 ml-2">
                <button
                  type="button"
                  onClick={() => setUserMenuOpen((v) => !v)}
                  aria-label="User menu"
                  aria-expanded={userMenuOpen}
                  className="flex items-center gap-2"
                >
                  <div className="h-8 w-8 rounded-full gradient-primary flex items-center justify-center">
                    <span className="text-xs font-bold text-primary-foreground">
                      {user?.firstName?.[0]}
                      {user?.lastName?.[0]}
                    </span>
                  </div>
                </button>

                {/* Right sidebar popup (slide-in like admin panel) */}
                <div
                  className={`fixed inset-0 z-40 bg-black/20 transition-opacity duration-200 ${
                    userMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                  }`}
                  onClick={() => setUserMenuOpen(false)}
                />

                <aside
                  className={`fixed top-0 right-0 z-50 h-svh w-72 border-l bg-card shadow-lg transform-gpu transition-transform duration-200 ${
                    userMenuOpen ? "translate-x-0" : "translate-x-full"
                  }`}
                  onClick={(e) => e.stopPropagation()}
                  aria-hidden={!userMenuOpen}
                >
                  <div className="flex items-center justify-between px-4 py-3 border-b">
                    <div className="font-semibold text-sm">
                      {user?.firstName ? `${user.firstName}${user?.lastName ? ` ${user.lastName}` : ""}` : "Account"}
                    </div>
                    <button
                      type="button"
                      onClick={() => setUserMenuOpen(false)}
                      aria-label="Close account menu"
                      className="p-1 rounded hover:bg-muted transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>

                  <nav className="p-2 space-y-1 flex flex-col flex-1">
                    <NavLink
                      to="/bookings"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-green-50 hover:text-green-700 transition-all duration-200 ease-in-out"
                      activeClassName="text-green-700 font-semibold"
                    >
                      <BookOpen className="h-4 w-4" />
                      My Bookings
                    </NavLink>

                    <NavLink
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 w-full px-3 py-2 text-sm rounded-lg text-muted-foreground hover:bg-green-50 hover:text-green-700 transition-all duration-200 ease-in-out"
                      activeClassName="text-green-700 font-semibold"
                    >
                      <User className="h-4 w-4" />
                      My Profile
                    </NavLink>

                    <div className="h-px bg-muted my-2" />

                    <Button
                      variant="ghost"
                      className="w-full justify-start text-muted-foreground hover:bg-red-50 hover:text-red-700 transition-all duration-200 ease-in-out mt-auto"
                      onClick={requestLogout}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Log out
                    </Button>
                  </nav>
                </aside>
              </div>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>
                Log in
              </Button>
              <Button size="sm" onClick={() => navigate("/register")}>
                Sign up
              </Button>
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-card px-4 pb-4 pt-2 space-y-2 animate-fade-in">
          <NavLink
            to="/"
            onClick={() => setMobileOpen(false)}
            className="block py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 ease-in-out transform-gpu hover:bg-green-50 hover:text-green-700 hover:scale-[1.02]"
            activeClassName="text-green-600 font-semibold text-[15px] underline underline-offset-4"
          >
            Home
          </NavLink>
          <NavLink
            to="/events"
            onClick={() => setMobileOpen(false)}
            className="block py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 ease-in-out transform-gpu hover:bg-green-50 hover:text-green-700 hover:scale-[1.02]"
            activeClassName="text-green-600 font-semibold text-[15px] underline underline-offset-4"
          >
            Events
          </NavLink>
          {isAuthenticated ? (
            <>
              <NavLink
                to={isAdmin ? "/admin" : "/dashboard"}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 ease-in-out transform-gpu hover:bg-green-50 hover:text-green-700 hover:scale-[1.02]"
                activeClassName="text-green-600 font-semibold text-[15px] underline underline-offset-4"
              >
                <LayoutDashboard className="h-4 w-4" /> {isAdmin ? "Admin" : "Dashboard"}
              </NavLink>
              <NavLink
                to="/bookings"
                onClick={() => setMobileOpen(false)}
                className="block py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 ease-in-out transform-gpu hover:bg-green-50 hover:text-green-700 hover:scale-[1.02]"
                activeClassName="text-green-600 font-semibold text-[15px] underline underline-offset-4"
              >
                My Bookings
              </NavLink>
              <NavLink
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 py-2 px-3 text-sm font-medium rounded-md transition-all duration-200 ease-in-out transform-gpu hover:bg-green-50 hover:text-green-700 hover:scale-[1.02]"
                activeClassName="text-green-600 font-semibold text-[15px]"
              >
                <User className="h-4 w-4" /> Profile
              </NavLink>
              <Button variant="ghost" size="sm" className="w-full justify-start" onClick={requestLogout}>
                <LogOut className="h-4 w-4 mr-2" /> Logout
              </Button>
            </>
          ) : (
            <div className="flex gap-2 pt-2">
              <Button variant="ghost" size="sm" className="flex-1" onClick={() => { navigate("/login"); setMobileOpen(false); }}>Log in</Button>
              <Button size="sm" className="flex-1" onClick={() => { navigate("/register"); setMobileOpen(false); }}>Sign up</Button>
            </div>
          )}
        </div>
      )}

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
                handleLogout();
              }}
            >
              Log out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
};
