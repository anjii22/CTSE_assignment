import { useState, FormEvent } from 'react';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/userService';
import { Navbar } from '../components/layout/Navbar';
import { Card } from '../components/ui/Card';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { User } from 'lucide-react';
import { navigate } from '../components/navigation/history';
import { useToast } from '../components/ui/Toast';

export const Profile = () => {
  const { user } = useAuth();
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);

    try {
      await userService.updateProfile(user._id, formData);
      toast.success('Profile updated successfully.');
      setEditing(false);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    navigate('/login');
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Redirecting to login…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        <Card className="p-8">
          <div className="flex items-center gap-4 mb-8 pb-8 border-b">
            <div className="bg-blue-100 w-20 h-20 rounded-full flex items-center justify-center">
              <User className="text-blue-600" size={40} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {user.firstName} {user.lastName}
              </h2>
              <p className="text-gray-600">{user.email}</p>
              <span
                className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {user.role}
              </span>
            </div>
          </div>

          {editing ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  label="First Name"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                />
                <Input
                  label="Last Name"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  required
                />
              </div>

              <Input
                type="email"
                label="Email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />

              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditing(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" loading={loading} className="flex-1">
                  Save Changes
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-lg text-gray-900 mt-1">
                  {user.firstName} {user.lastName}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-lg text-gray-900 mt-1">{user.email}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-500">Account Type</label>
                <p className="text-lg text-gray-900 mt-1 capitalize">{user.role}</p>
              </div>

              <Button onClick={() => setEditing(true)}>Edit Profile</Button>
            </div>
          )}
        </Card>

        {/* <Card className="p-6 mt-6 border-red-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Danger Zone</h3>
          <p className="text-gray-600 text-sm mb-4">
            Once you logout, you'll need to sign in again to access your account.
          </p>
          <Button variant="danger" onClick={logout}>
            Logout
          </Button>
        </Card> */}
      </div>
    </div>
  );
};
