import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from '../lib/axios';

interface Stats {
  total?: number;
  byStatus?: {
    open?: number;
    inProgress?: number;
    resolved?: number;
    closed?: number;
    pending?: number;
  };
}

export const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/tickets/stats');
        setStats(response.data.data || {});
      } catch {
        // silently ignore — stats are non-critical
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const val = (n?: number) => (loading ? '—' : (n ?? 0).toString());

  const roleSubtitle: Record<string, string> = {
    ADMIN:    'Full administrative access · Manage users, tickets, and system settings.',
    AGENT:    'Support queue · Resolve assigned tickets and assist customers.',
    CUSTOMER: 'How can we help? Open a ticket and our team will get back to you shortly.',
  };

  return (
    <div className="space-y-8 animate-fadeIn">

      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-700 via-primary-600 to-primary-800 rounded-2xl px-8 py-10 text-white shadow-lg">
        <div className="relative z-10">
          <p className="text-primary-200 text-sm font-medium uppercase tracking-widest mb-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
          <h1 className="text-3xl font-bold mb-2">
            Good {getGreeting()}, {user?.firstName}.
          </h1>
          <p className="text-primary-100 max-w-xl">
            {roleSubtitle[user?.role ?? ''] ?? ''}
          </p>
        </div>
        {/* decorative circle */}
        <div className="absolute -right-10 -top-10 w-52 h-52 rounded-full bg-white/5" />
        <div className="absolute -right-4 -bottom-16 w-72 h-72 rounded-full bg-white/5" />
      </div>

      {/* Stats */}
      <div>
        <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider mb-4">Ticket overview</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total" value={val(stats.total)}          accent="border-primary-500" />
          <StatCard label="Open"      value={val(stats.byStatus?.open)}       accent="border-amber-400" />
          <StatCard label="In Progress" value={val(stats.byStatus?.inProgress)} accent="border-violet-500" />
          <StatCard label="Resolved"  value={val(stats.byStatus?.resolved)}   accent="border-emerald-500" />
        </div>
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider mb-4">Quick actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {user?.role === 'CUSTOMER' && (
            <ActionCard
              title="New Ticket"
              description="Submit a support request"
              icon={<PlusIcon />}
              onClick={() => navigate('/tickets/create')}
            />
          )}
          <ActionCard
            title="All Tickets"
            description={user?.role === 'CUSTOMER' ? 'View your tickets' : 'Manage support queue'}
            icon={<TicketIcon />}
            onClick={() => navigate('/tickets')}
          />
          <ActionCard
            title="Profile"
            description="Manage your account"
            icon={<UserIcon />}
            onClick={() => navigate('/profile')}
          />
          {user?.role === 'ADMIN' && (
            <>
              <ActionCard
                title="User Management"
                description="Create and manage users"
                icon={<UsersIcon />}
                onClick={() => navigate('/admin/users')}
              />
              <ActionCard
                title="Admin Panel"
                description="System overview and stats"
                icon={<ChartIcon />}
                onClick={() => navigate('/admin/dashboard')}
              />
            </>
          )}
        </div>
      </div>

      {/* Account summary */}
      <div>
        <h2 className="text-base font-semibold text-gray-500 uppercase tracking-wider mb-4">Account</h2>
        <div className="card bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <InfoRow label="Email" value={user?.email ?? '—'} />
            <InfoRow label="Phone" value={user?.phone ?? 'Not provided'} />
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Role</p>
              <RoleBadge role={user?.role ?? ''} />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">Email status</p>
              {user?.isEmailVerified
                ? <span className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600"><span>●</span> Verified</span>
                : <span className="inline-flex items-center gap-1 text-sm font-medium text-amber-500"><span>●</span> Unverified</span>
              }
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

/* ─── Helpers ─────────────────────────────────────────────────────────────── */

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'morning';
  if (h < 17) return 'afternoon';
  return 'evening';
}

function StatCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  return (
    <div className={`bg-white rounded-xl border-t-4 ${accent} shadow-sm px-5 py-5`}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
    </div>
  );
}

function ActionCard({
  title, description, icon, onClick,
}: { title: string; description: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex items-start gap-4 bg-white rounded-xl border border-gray-200 p-5 text-left shadow-sm hover:border-primary-400 hover:shadow-md transition-all duration-200"
    >
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-50 flex items-center justify-center text-primary-600 group-hover:bg-primary-100 transition-colors">
        {icon}
      </div>
      <div>
        <p className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors">{title}</p>
        <p className="text-sm text-gray-500 mt-0.5">{description}</p>
      </div>
    </button>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">{label}</p>
      <p className="text-sm font-medium text-gray-800 truncate">{value}</p>
    </div>
  );
}

function RoleBadge({ role }: { role: string }) {
  const styles: Record<string, string> = {
    ADMIN:    'bg-rose-50 text-rose-700 ring-rose-200',
    AGENT:    'bg-blue-50 text-blue-700 ring-blue-200',
    CUSTOMER: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ${styles[role] ?? 'bg-gray-100 text-gray-600 ring-gray-200'}`}>
      {role}
    </span>
  );
}

/* ─── Icon stubs (inline SVG, no extra dep) ───────────────────────────────── */
import React from 'react';

const PlusIcon  = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>;
const TicketIcon= () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>;
const UserIcon  = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>;
const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
const ChartIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>;
