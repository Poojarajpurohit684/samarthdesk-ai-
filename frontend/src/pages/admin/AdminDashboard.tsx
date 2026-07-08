import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const navigation = [
    { name: 'Overview', href: '/admin/dashboard', icon: '📊' },
    { name: 'User Management', href: '/admin/users', icon: '👥' },
    { name: 'Tickets', href: '/admin/tickets', icon: '🎫', disabled: true },
    { name: 'Analytics', href: '/admin/analytics', icon: '📈', disabled: true },
    { name: 'Settings', href: '/admin/settings', icon: '⚙️', disabled: true },
  ];

  const isActive = (href: string) => location.pathname === href;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">Samarthdesk AI - Admin</h1>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/profile')}
                className="text-gray-600 hover:text-gray-900"
              >
                My Profile
              </button>
              <span className="text-sm text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800">
                ADMIN
              </span>
              <button onClick={() => logout()} className="btn btn-outline">
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <aside className="w-full md:w-64 flex-shrink-0">
            <nav className="space-y-1">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg
                    ${
                      isActive(item.href)
                        ? 'bg-primary-50 text-primary-700 border-l-4 border-primary-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }
                    ${item.disabled ? 'opacity-50 cursor-not-allowed' : ''}
                  `}
                  onClick={(e) => item.disabled && e.preventDefault()}
                >
                  <span className="mr-3 text-xl">{item.icon}</span>
                  {item.name}
                  {item.disabled && (
                    <span className="ml-auto text-xs text-gray-500">Soon</span>
                  )}
                </Link>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
};
