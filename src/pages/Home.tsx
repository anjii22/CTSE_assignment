import { useAuth } from '../context/AuthContext';
import { Link } from '../components/navigation/Link';
import { Button } from '../components/ui/Button';
import { Calendar, Ticket, Shield, Zap } from 'lucide-react';

export const Home = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 text-xl font-bold text-blue-600">
              <Calendar size={28} />
              <span>EventHub</span>
            </div>

            <div className="flex items-center gap-4">
              {user ? (
                <Link to={user.role === 'admin' ? '/admin' : '/dashboard'}>
                  <Button>Go to Dashboard</Button>
                </Link>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost">Login</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Sign Up</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            Discover Amazing Events
            <br />
            <span className="text-blue-600">Near You</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Book tickets for concerts, conferences, sports events, and more. Experience the best
            events in your city with EventHub.
          </p>
          <div className="flex gap-4 justify-center">
            <Link to={user ? '/dashboard' : '/register'}>
              <Button size="lg">Get Started</Button>
            </Link>
            <Link to="/dashboard">
              <Button size="lg" variant="secondary">
                Browse Events
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto mt-20">
          <div className="text-center p-6">
            <div className="bg-blue-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Ticket className="text-blue-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Easy Booking</h3>
            <p className="text-gray-600">
              Book tickets in seconds with our streamlined checkout process
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-green-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Shield className="text-green-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Secure Payments</h3>
            <p className="text-gray-600">
              Your transactions are protected with enterprise-grade security
            </p>
          </div>

          <div className="text-center p-6">
            <div className="bg-yellow-100 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Zap className="text-yellow-600" size={32} />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Instant Confirmation</h3>
            <p className="text-gray-600">
              Get your tickets delivered instantly via email after booking
            </p>
          </div>
        </div>
      </div>

      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Calendar size={24} />
            <span className="text-xl font-bold">EventHub</span>
          </div>
          <p className="text-gray-400">
            Your trusted platform for discovering and booking events
          </p>
        </div>
      </footer>
    </div>
  );
};
