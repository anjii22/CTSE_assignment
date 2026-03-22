import { AuthProvider, useAuth } from './context/AuthContext';
import { Router } from './components/navigation/Router';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UserDashboard } from './pages/UserDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { Profile } from './pages/Profile';
import { Bookings } from './pages/Bookings';
import { Payments } from './pages/Payments';
import { ErrorBoundary } from './components/error/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';

function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Router
      routes={[
        { path: '/', component: <Home /> },
        { path: '/login', component: <Login /> },
        { path: '/register', component: <Register /> },
        {
          path: '/dashboard',
          component: user ? <UserDashboard /> : <Login />,
        },
        {
          path: '/admin',
          component: user?.role === 'admin' ? <AdminDashboard /> : <Login />,
        },
        {
          path: '/profile',
          component: user ? <Profile /> : <Login />,
        },
        {
          path: '/bookings',
          component: user ? <Bookings /> : <Login />,
        },
        {
          path: '/payments',
          component: user ? <Payments /> : <Login />,
        },
      ]}
      notFound={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">404</h1>
            <p className="text-gray-600">Page not found</p>
          </div>
        </div>
      }
    />
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
