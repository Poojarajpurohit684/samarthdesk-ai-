import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ticketService } from '../../services/ticket.service';

export const TicketList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['tickets', page, search, statusFilter, priorityFilter, categoryFilter],
    queryFn: () =>
      ticketService.getTickets({
        page,
        limit: 10,
        search: search || undefined,
        status: statusFilter || undefined,
        priority: priorityFilter || undefined,
        category: categoryFilter || undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['ticket-stats'],
    queryFn: ticketService.getTicketStats,
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN': return 'bg-blue-100 text-blue-800';
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'IN_PROGRESS': return 'bg-purple-100 text-purple-800';
      case 'RESOLVED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-gray-100 text-gray-800';
      case 'MEDIUM': return 'bg-blue-100 text-blue-800';
      case 'HIGH': return 'bg-orange-100 text-orange-800';
      case 'URGENT': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Support Tickets</h1>
        <button onClick={() => navigate('/tickets/create')} className="btn btn-primary">
          Create Ticket
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Total</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.total || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Open</h3>
          <p className="mt-2 text-3xl font-semibold text-blue-600">{stats?.byStatus.open || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">In Progress</h3>
          <p className="mt-2 text-3xl font-semibold text-purple-600">{stats?.byStatus.inProgress || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Resolved</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">{stats?.byStatus.resolved || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Closed</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-600">{stats?.byStatus.closed || 0}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Search tickets..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input"
          >
            <option value="">All Status</option>
            <option value="OPEN">Open</option>
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="input"
          >
            <option value="">All Priority</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input"
          >
            <option value="">All Categories</option>
            <option value="BILLING">Billing</option>
            <option value="TECHNICAL">Technical</option>
            <option value="BUG">Bug</option>
            <option value="FEATURE_REQUEST">Feature Request</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {/* Tickets List */}
      <div className="card">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : data?.tickets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">No tickets found</p>
            <button onClick={() => navigate('/tickets/create')} className="mt-4 btn btn-primary">
              Create Your First Ticket
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.tickets.map((ticket) => (
              <div
                key={ticket.id}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-sm font-mono text-gray-500">{ticket.ticketNumber}</span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(ticket.status)}`}>
                        {ticket.status.replace('_', ' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        {ticket.category.replace('_', ' ')}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{ticket.title}</h3>
                    <p className="text-sm text-gray-600 line-clamp-2">{ticket.description}</p>
                    <div className="mt-3 flex items-center gap-4 text-xs text-gray-500">
                      <span>Created by: {ticket.createdBy.firstName} {ticket.createdBy.lastName}</span>
                      {ticket.assignedTo && (
                        <span>Assigned to: {ticket.assignedTo.firstName} {ticket.assignedTo.lastName}</span>
                      )}
                      <span>{new Date(ticket.createdAt).toLocaleDateString()}</span>
                      {ticket._count && (
                        <span>💬 {ticket._count.messages} messages</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div className="mt-6 flex items-center justify-between border-t pt-4">
            <div className="text-sm text-gray-700">
              Showing {(page - 1) * 10 + 1} to {Math.min(page * 10, data.pagination.total)} of{' '}
              {data.pagination.total} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-outline"
              >
                Previous
              </button>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page >= data.pagination.totalPages}
                className="btn btn-outline"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
