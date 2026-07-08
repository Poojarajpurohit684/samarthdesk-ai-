import { api } from '../lib/axios';

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  status: 'OPEN' | 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  category: 'BILLING' | 'PAYMENT' | 'TECHNICAL' | 'BUG' | 'FEATURE_REQUEST' | 'DELIVERY' | 'REFUND' | 'AUTHENTICATION' | 'ACCOUNT' | 'OTHER';
  tags: string[];
  aiSummary?: string;
  isAutoResolved: boolean;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  closedAt?: string;
  createdBy: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  assignedTo?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  _count?: {
    messages: number;
    attachments: number;
  };
}

export interface CreateTicketData {
  title: string;
  description: string;
  category?: string;
  priority?: string;
}

export interface UpdateTicketData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  category?: string;
  tags?: string[];
  assignedToId?: string;
}

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: string;
  priority?: string;
  category?: string;
  assignedToId?: string;
  createdById?: string;
  search?: string;
}

class TicketService {
  async createTicket(data: CreateTicketData): Promise<Ticket> {
    const response = await api.post('/tickets', data);
    return response.data.data;
  }

  async getTickets(filters?: TicketFilters): Promise<{
    tickets: Ticket[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const response = await api.get('/tickets', { params: filters });
    return {
      tickets: response.data.data,
      pagination: response.data.pagination,
    };
  }

  async getTicketById(id: string): Promise<Ticket> {
    const response = await api.get(`/tickets/${id}`);
    return response.data.data;
  }

  async updateTicket(id: string, data: UpdateTicketData): Promise<Ticket> {
    const response = await api.put(`/tickets/${id}`, data);
    return response.data.data;
  }

  async deleteTicket(id: string): Promise<void> {
    await api.delete(`/tickets/${id}`);
  }

  async assignTicket(id: string, agentId: string): Promise<Ticket> {
    const response = await api.post(`/tickets/${id}/assign`, { agentId });
    return response.data.data;
  }

  async getTicketStats(): Promise<{
    total: number;
    byStatus: {
      open: number;
      pending: number;
      inProgress: number;
      resolved: number;
      closed: number;
    };
    byPriority: Record<string, number>;
    byCategory: Record<string, number>;
  }> {
    const response = await api.get('/tickets/stats');
    return response.data.data;
  }

  async getMessages(ticketId: string) {
    const response = await api.get(`/tickets/${ticketId}/messages`);
    return response.data.data;
  }

  async sendMessage(ticketId: string, message: string, isInternal = false) {
    const response = await api.post(`/tickets/${ticketId}/messages`, { message, isInternal });
    return response.data.data;
  }

  async aiDraftReply(ticketId: string, tone = 'PROFESSIONAL') {
    const response = await api.post(`/tickets/${ticketId}/messages/ai-draft`, { tone });
    return response.data.data.draft as string;
  }

  async aiImproveGrammar(ticketId: string, text: string) {
    const response = await api.post(`/tickets/${ticketId}/messages/ai-improve`, { text });
    return response.data.data.improved as string;
  }
}

export const ticketService = new TicketService();
