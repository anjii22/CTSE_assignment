import { useState } from 'react';
import { Link } from '../navigation/Link';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Calendar, Menu } from 'lucide-react';
import { Sidebar } from './Sidebar';

export const Navbar = () => {
  const { user, logout, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-blue-600 hover:text-blue-700">
            <Calendar size={28} />
            <span>EventHub</span>
          </Link>

          <div className="flex items-center gap-6">
            {user ? (
              <>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-2 text-gray-700 hover:text-blue-600 transition-colors px-2 py-1 rounded-lg hover:bg-gray-50"
                  aria-label="Open menu"
                >
                  <Menu size={20} />
                  <span className="hidden sm:inline">{user.firstName}</span>
                </button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={logout}
        isAdmin={isAdmin}
        eventsHref={isAdmin ? '/admin' : '/dashboard'}
      />
    </nav>
  );
};
