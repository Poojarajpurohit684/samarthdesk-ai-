import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyEmail } from './pages/VerifyEmail';
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { Overview } from './pages/admin/Overview';
import { UserManagement } from './pages/admin/UserManagement';
import { TicketList } from './pages/tickets/TicketList';
import { CreateTicket } from './pages/tickets/CreateTicket';
import { TicketDetail } from './pages/tickets/TicketDetail';
import { ProtectedRoute } from './components/ProtectedRoute';
import { MainLayout } from './components/MainLayout';
import { useAuthStore } from './store/authStore';
// Ensures the /me query runs once on startup when a token exists
import { useAuth } from './hooks/useAuth';

function App() {
  const { setLoading } = useAuthStore();
  // This call ensures the /me query fires at root level when a token is present
  useAuth();

  // On mount: if no token exists, immediately mark loading as done.
  // If a token exists, the useAuth hook's query will call setUser/setLoading.
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
    }
  }, [setLoading]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        
        {/* Protected Routes with Layout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<MainLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/tickets" element={<TicketList />} />
            <Route path="/tickets/create" element={<CreateTicket />} />
            <Route path="/tickets/:id" element={<TicketDetail />} />
          </Route>
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminDashboard />}>
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<Overview />} />
            <Route path="users" element={<UserManagement />} />
          </Route>
        </Route>
        
        <Route path="/unauthorized" element={<Unauthorized />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function Landing() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Navbar */}
      <header className="w-full px-8 py-5 flex items-center justify-between border-b border-gray-200 bg-white">
        <span className="text-lg font-bold text-primary-700 tracking-tight">Samarthdesk AI</span>
        <div className="flex items-center gap-3">
          <a href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">Sign in</a>
          <a href="/register" className="btn btn-primary text-sm">Get started</a>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="max-w-2xl">
          <span className="inline-block px-3 py-1 text-xs font-semibold text-primary-700 bg-primary-50 rounded-full border border-primary-200 mb-6">
            Customer Support Platform
          </span>
          <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-5">
            Support that scales<br />
            <span className="text-primary-600">with your business.</span>
          </h1>
          <p className="text-lg text-gray-500 mb-10 max-w-xl mx-auto">
            Manage tickets, agents, and customers from one place. Role-based access, real-time updates, and a clean interface your team will actually use.
          </p>
          <div className="flex items-center justify-center gap-4">
            <a href="/register" className="btn btn-primary px-6 py-3 text-base">Start for free</a>
            <a href="/login" className="btn btn-outline px-6 py-3 text-base">Sign in</a>
          </div>
        </div>

        {/* Feature pills */}
        <div className="mt-16 flex flex-wrap justify-center gap-3 text-sm text-gray-600">
          {['JWT Authentication', 'Role-Based Access', 'Ticket Management', 'Admin Dashboard', 'Real-time Ready'].map(f => (
            <span key={f} className="px-3 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm">{f}</span>
          ))}
        </div>
      </main>

      <footer className="py-6 text-center text-xs text-gray-400 border-t border-gray-200">
        © {new Date().getFullYear()} Samarthdesk AI
      </footer>
    </div>
  );
}

function Unauthorized() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="text-center max-w-md">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-6">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
        <p className="text-gray-600 mb-8">
          You don't have permission to view this page.
        </p>
        <a href="/dashboard" className="btn btn-primary">
          Go to Dashboard
        </a>
      </div>
    </div>
  );
}

export default App;
