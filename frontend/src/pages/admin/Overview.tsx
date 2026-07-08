import { useQuery } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import { useNavigate } from 'react-router-dom';

export const Overview = () => {
  const navigate = useNavigate();
  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: userService.getUserStats,
  });

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Admin Overview</h2>
        <p className="text-sm text-gray-500 mt-1">System-wide metrics and administration tools</p>
      </div>

      {/* User Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Total Users"
          value={stats?.total || 0}
          subtitle="All registered accounts"
          color="text-gray-900"
          bgColor="bg-gray-50"
        />
        <StatCard
          label="Active"
          value={stats?.active || 0}
          subtitle="Currently active"
          color="text-emerald-700"
          bgColor="bg-emerald-50"
        />
        <StatCard
          label="Agents"
          value={stats?.agents || 0}
          subtitle="Support staff"
          color="text-blue-700"
          bgColor="bg-blue-50"
        />
        <StatCard
          label="Customers"
          value={stats?.customers || 0}
          subtitle="Customer accounts"
          color="text-violet-700"
          bgColor="bg-violet-50"
        />
      </div>

      {/* Quick Actions */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-5">Quick actions</h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            onClick={() => navigate('/admin/users')}
            className="btn btn-primary"
          >
            Manage Users
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/tickets')}>
            View All Tickets
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/profile')}>
            Your Profile
          </button>
        </div>
      </div>

      {/* System Health */}
      <div className="card bg-gradient-to-br from-emerald-50 to-teal-50 border-emerald-200">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-emerald-900 mb-1">System operational</h3>
            <p className="text-sm text-emerald-700">
              All services running normally. Authentication, database, and API responding as expected.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

function StatCard({ label, value, subtitle, color, bgColor }: {
  label: string;
  value: number;
  subtitle: string;
  color: string;
  bgColor: string;
}) {
  return (
    <div className={`rounded-xl ${bgColor} border border-gray-200 p-6`}>
      <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">{label}</p>
      <p className={`text-4xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-600 mt-2">{subtitle}</p>
    </div>
  );
}
