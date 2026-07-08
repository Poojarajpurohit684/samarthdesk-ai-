import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export const MainLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const NavButton = ({ path, label }: { path: string; label: string }) => (
    <button
      onClick={() => navigate(path)}
      className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
        isActive(path)
          ? 'bg-primary-100 text-primary-700 shadow-sm'
          : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-red-100 text-red-800 ring-red-600/20';
      case 'AGENT':
        return 'bg-blue-100 text-blue-800 ring-blue-600/20';
      case 'CUSTOMER':
        return 'bg-green-100 text-green-800 ring-green-600/20';
      default:
        return 'bg-gray-100 text-gray-800 ring-gray-600/20';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      {/* Enhanced Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 backdrop-blur-lg bg-white/95">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            {/* Left side - Logo and Navigation */}
            <div className="flex items-center space-x-2">
              {/* Logo */}
              <div
                onClick={() => navigate('/dashboard')}
                className="flex items-center space-x-2 cursor-pointer group"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-700 rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
                  <span className="text-white font-bold text-lg">S</span>
                </div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                  Samarthdesk AI
                </h1>
              </div>

              {/* Navigation Links */}
              <div className="hidden md:flex items-center space-x-1 ml-6">
                <NavButton path="/dashboard" label="Dashboard" />
                <NavButton path="/tickets" label="Tickets" />
                <NavButton path="/profile" label="Profile" />
                {user?.role === 'ADMIN' && (
                  <NavButton path="/admin/dashboard" label="Admin Panel" />
                )}
              </div>
            </div>

            {/* Right side - User Info and Logout */}
            <div className="flex items-center space-x-4">
              {/* User Info */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName} {user?.lastName}
                  </p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <span
                  className={`px-3 py-1 text-xs font-semibold rounded-full ring-1 ring-inset ${getRoleBadgeColor(
                    user?.role || ''
                  )}`}
                >
                  {user?.role}
                </span>
              </div>

              {/* Logout Button */}
              <button
                onClick={() => logout()}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-all duration-200 shadow-sm hover:shadow"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden flex items-center space-x-2 pb-3 overflow-x-auto">
            <NavButton path="/dashboard" label="Dashboard" />
            <NavButton path="/tickets" label="Tickets" />
            <NavButton path="/profile" label="Profile" />
            {user?.role === 'ADMIN' && (
              <NavButton path="/admin/dashboard" label="Admin" />
            )}
          </div>
        </div>
      </nav>

      {/* Enhanced Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="animate-fadeIn">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-gray-500">
            © {new Date().getFullYear()} Samarthdesk AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};
