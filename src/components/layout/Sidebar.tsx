import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from '../navigation/Link';
import { Button } from '../ui/Button';
import { Calendar, CreditCard, LogOut, Ticket, User, Plus, Shield } from 'lucide-react';

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  isAdmin?: boolean;
  eventsHref?: string;
};

export const Sidebar = ({ isOpen, onClose, onLogout, isAdmin, eventsHref = '/dashboard' }: SidebarProps) => {
  const panelRef = useRef<HTMLDivElement | null>(null);
  const [location, setLocation] = useState(() => ({
    pathname: window.location.pathname,
    search: window.location.search,
  }));

  const styles = useMemo(() => {
    const base =
      'flex items-center gap-3 px-3 py-2 rounded-lg text-gray-800 hover:bg-gray-50 transition-colors';
    const active = 'bg-blue-50 text-blue-700';
    const icon = 'text-gray-500';
    const iconActive = 'text-blue-600';
    return { base, active, icon, iconActive };
  }, []);

  const isActive = (href: string) => {
    const path = href.split('?')[0];
    return location.pathname === path;
  };

  const isAdminActionActive = (tab: 'events' | 'admins') => {
    if (location.pathname !== '/admin') return false;
    const params = new URLSearchParams(location.search);
    return params.get('tab') === tab && params.get('action') === 'create';
  };

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const onMouseDown = (e: MouseEvent) => {
      if (!panelRef.current) return;
      if (!panelRef.current.contains(e.target as Node)) onClose();
    };
    const onPopState = () => {
      setLocation({ pathname: window.location.pathname, search: window.location.search });
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('popstate', onPopState);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('popstate', onPopState);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        ref={panelRef}
        className="absolute right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl border-l border-gray-200 p-4"
        role="dialog"
        aria-modal="true"
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-gray-900">Menu</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              Close
            </Button>
          </div>

          <div className="space-y-2">
            <Link
              to={eventsHref}
              className={`${styles.base} ${isActive(eventsHref) ? styles.active : ''}`}
              onClick={onClose}
            >
              <Calendar size={18} className={isActive(eventsHref) ? styles.iconActive : styles.icon} />
              Events
            </Link>

            <Link
              to="/bookings"
              className={`${styles.base} ${isActive('/bookings') ? styles.active : ''}`}
              onClick={onClose}
            >
              <Ticket size={18} className={isActive('/bookings') ? styles.iconActive : styles.icon} />
              My Bookings
            </Link>

            <Link
              to="/payments"
              className={`${styles.base} ${isActive('/payments') ? styles.active : ''}`}
              onClick={onClose}
            >
              <CreditCard size={18} className={isActive('/payments') ? styles.iconActive : styles.icon} />
              My Payments
            </Link>
          </div>

          {isAdmin && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 px-1 mb-2">ADMIN</p>
              <div className="space-y-2">
                <Link
                  to="/admin?tab=events&action=create"
                  className={`${styles.base} ${isAdminActionActive('events') ? styles.active : ''}`}
                  onClick={onClose}
                >
                  <Plus size={18} className={isAdminActionActive('events') ? styles.iconActive : styles.icon} />
                  Create Event
                </Link>
                <Link
                  to="/admin?tab=admins&action=create"
                  className={`${styles.base} ${isAdminActionActive('admins') ? styles.active : ''}`}
                  onClick={onClose}
                >
                  <Shield size={18} className={isAdminActionActive('admins') ? styles.iconActive : styles.icon} />
                  Create Admin Account
                </Link>
              </div>
            </div>
          )}

          <div className="mt-auto pt-6 border-t border-gray-200 space-y-3">
            <Link
              to="/profile"
              className={`${styles.base} ${isActive('/profile') ? styles.active : ''}`}
              onClick={onClose}
            >
              <User size={18} className={isActive('/profile') ? styles.iconActive : styles.icon} />
              My Profile
            </Link>

            <Button
              variant="danger"
              className="w-full flex items-center justify-center gap-2"
              onClick={() => {
                onClose();
                onLogout();
              }}
            >
              <LogOut size={18} />
              Logout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

