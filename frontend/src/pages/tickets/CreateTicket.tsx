import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { ticketService, CreateTicketData } from '../../services/ticket.service';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const createTicketSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum(['BILLING', 'PAYMENT', 'TECHNICAL', 'BUG', 'FEATURE_REQUEST', 'DELIVERY', 'REFUND', 'AUTHENTICATION', 'ACCOUNT', 'OTHER']),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
});

type CreateTicketFormData = z.infer<typeof createTicketSchema>;

export const CreateTicket = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTicketFormData>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      category: 'OTHER',
      priority: 'MEDIUM',
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: CreateTicketData) => ticketService.createTicket(data),
    onSuccess: (ticket) => {
      toast.success('Ticket created successfully!');
      navigate(`/tickets/${ticket.id}`);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create ticket');
    },
  });

  const onSubmit = (data: CreateTicketFormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate('/tickets')}
          className="text-primary-600 hover:text-primary-700 mb-4"
        >
          ← Back to Tickets
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Create New Ticket</h1>
        <p className="mt-2 text-gray-600">
          Describe your issue and we'll help you resolve it as quickly as possible.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title *
          </label>
          <input
            {...register('title')}
            id="title"
            type="text"
            className="input mt-1"
            placeholder="Brief description of your issue"
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description *
          </label>
          <textarea
            {...register('description')}
            id="description"
            rows={6}
            className="input mt-1"
            placeholder="Please provide as much detail as possible..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Category *
            </label>
            <select {...register('category')} id="category" className="input mt-1">
              <option value="OTHER">Other</option>
              <option value="BILLING">Billing</option>
              <option value="PAYMENT">Payment</option>
              <option value="TECHNICAL">Technical Support</option>
              <option value="BUG">Bug Report</option>
              <option value="FEATURE_REQUEST">Feature Request</option>
              <option value="DELIVERY">Delivery</option>
              <option value="REFUND">Refund</option>
              <option value="AUTHENTICATION">Authentication</option>
              <option value="ACCOUNT">Account</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Priority *
            </label>
            <select {...register('priority')} id="priority" className="input mt-1">
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
            {errors.priority && (
              <p className="mt-1 text-sm text-red-600">{errors.priority.message}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end space-x-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/tickets')}
            className="btn btn-outline"
            disabled={createMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>
      </form>
    </div>
  );
};
