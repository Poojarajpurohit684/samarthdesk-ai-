import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { userService } from '../../services/user.service';
import { User } from '../../services/auth.service';
import toast from 'react-hot-toast';
import { CreateUserModal } from '../../components/CreateUserModal';
import { EditUserModal } from '../../components/EditUserModal';

export const UserManagement = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'CUSTOMER' | 'AGENT' | 'ADMIN' | ''>('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive' | ''>('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search, roleFilter, statusFilter],
    queryFn: () =>
      userService.listUsers({
        page,
        limit: 10,
        search: search || undefined,
        role: roleFilter || undefined,
        isActive: statusFilter === 'active' ? true : statusFilter === 'inactive' ? false : undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ['user-stats'],
    queryFn: userService.getUserStats,
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => userService.deactivateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success('User deactivated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to deactivate user');
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => userService.activateUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success('User activated successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to activate user');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-stats'] });
      toast.success('User deleted successfully');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete user');
    },
  });

  const handleToggleStatus = (user: User) => {
    if (user.isActive) {
      deactivateMutation.mutate(user.id);
    } else {
      activateMutation.mutate(user.id);
    }
  };

  const handleDelete = (user: User) => {
    if (window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) {
      deleteMutation.mutate(user.id);
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-purple-100 text-purple-800';
      case 'AGENT':
        return 'bg-blue-100 text-blue-800';
      case 'CUSTOMER':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Total Users</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.total || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Active Users</h3>
          <p className="mt-2 text-3xl font-semibold text-green-600">{stats?.active || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Customers</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.customers || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Agents</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.agents || 0}</p>
        </div>
        <div className="card">
          <h3 className="text-sm font-medium text-gray-500">Admins</h3>
          <p className="mt-2 text-3xl font-semibold text-gray-900">{stats?.admins || 0}</p>
        </div>
      </div>

      {/* Filters and Actions */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <input
              type="text"
              placeholder="Search users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input max-w-xs"
            />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value as any)}
              className="input max-w-xs"
            >
              <option value="">All Roles</option>
              <option value="CUSTOMER">Customer</option>
              <option value="AGENT">Agent</option>
              <option value="ADMIN">Admin</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="input max-w-xs"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>

          <button onClick={() => setIsCreateModalOpen(true)} className="btn btn-primary">
            Create User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {data?.users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-primary-100 flex items-center justify-center">
                              <span className="text-sm font-medium text-primary-800">
                                {user.firstName[0]}
                                {user.lastName[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            <div className="text-sm text-gray-500">{user.phone || 'No phone'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        {user.isEmailVerified && (
                          <div className="text-xs text-green-600">✓ Verified</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                            user.role
                          )}`}
                        >
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            user.isActive
                              ? 'bg-green-100 text-green-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setEditingUser(user)}
                          className="text-primary-600 hover:text-primary-900 mr-3"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(user)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.pagination.totalPages > 1 && (
              <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
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
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing{' '}
                      <span className="font-medium">{(page - 1) * 10 + 1}</span> to{' '}
                      <span className="font-medium">
                        {Math.min(page * 10, data.pagination.total)}
                      </span>{' '}
                      of <span className="font-medium">{data.pagination.total}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                      <button
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="btn btn-outline rounded-r-none"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={page >= data.pagination.totalPages}
                        className="btn btn-outline rounded-l-none"
                      >
                        Next
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modals */}
      {isCreateModalOpen && (
        <CreateUserModal
          onClose={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ['users'] });
            queryClient.invalidateQueries({ queryKey: ['user-stats'] });
          }}
        />
      )}

      {editingUser && (
        <EditUserModal
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSuccess={() => {
            setEditingUser(null);
            queryClient.invalidateQueries({ queryKey: ['users'] });
          }}
        />
      )}
    </div>
  );
};
