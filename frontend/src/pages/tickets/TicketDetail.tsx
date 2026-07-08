import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ticketService } from '../../services/ticket.service';
import { api } from '../../lib/axios';
import { useAuth } from '../../hooks/useAuth';
import { joinTicketRoom, leaveTicketRoom, getSocket } from '../../lib/socket';
import toast from 'react-hot-toast';
import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  message: string;
  isInternal: boolean;
  isAIGenerated: boolean;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string;
  };
}

export const TicketDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ title: '', description: '' });
  const [replyText, setReplyText] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [aiDrafting, setAiDrafting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: ticket, isLoading } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketService.getTicketById(id!),
    enabled: !!id,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery<Message[]>({
    queryKey: ['ticket-messages', id],
    queryFn: async () => {
      const res = await api.get(`/tickets/${id}/messages`);
      return res.data.data;
    },
    enabled: !!id,
    refetchInterval: 15000,
  });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Join ticket socket room for real-time updates
  useEffect(() => {
    if (!id) return;
    joinTicketRoom(id);
    const socket = getSocket();
    if (socket) {
      const handler = (newMsg: Message) => {
        queryClient.setQueryData<Message[]>(['ticket-messages', id], (prev = []) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      };
      socket.on('message:new', handler);
      return () => {
        socket.off('message:new', handler);
        leaveTicketRoom(id);
      };
    }
    return () => leaveTicketRoom(id);
  }, [id, queryClient]);

  const updateMutation = useMutation({
    mutationFn: (data: any) => ticketService.updateTicket(id!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
      toast.success('Ticket updated');
      setIsEditing(false);
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Update failed'),
  });

  const replyMutation = useMutation({
    mutationFn: async (data: { message: string; isInternal: boolean }) => {
      const res = await api.post(`/tickets/${id}/messages`, data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', id] });
      setReplyText('');
      toast.success(isInternal ? 'Internal note added' : 'Reply sent');
    },
    onError: (error: any) => toast.error(error.response?.data?.message || 'Failed to send reply'),
  });

  const handleAiDraft = async () => {
    setAiDrafting(true);
    try {
      const res = await api.post(`/tickets/${id}/messages/ai-draft`, { tone: 'PROFESSIONAL' });
      setReplyText(res.data.data.draft);
      toast.success('AI draft ready — review before sending');
    } catch {
      toast.error('AI draft unavailable');
    } finally {
      setAiDrafting(false);
    }
  };

  const handleSendReply = () => {
    if (!replyText.trim()) return;
    replyMutation.mutate({ message: replyText.trim(), isInternal });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
      </div>
    );
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500 mb-4">Ticket not found</p>
        <button onClick={() => navigate('/tickets')} className="btn btn-primary">Back to Tickets</button>
      </div>
    );
  }

  const statusColor: Record<string, string> = {
    OPEN: 'bg-blue-100 text-blue-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    RESOLVED: 'bg-green-100 text-green-800',
    CLOSED: 'bg-gray-100 text-gray-800',
  };
  const priorityColor: Record<string, string> = {
    LOW: 'bg-gray-100 text-gray-800',
    MEDIUM: 'bg-blue-100 text-blue-800',
    HIGH: 'bg-orange-100 text-orange-800',
    URGENT: 'bg-red-100 text-red-800',
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'AGENT' || ticket.createdBy.id === user?.id;
  const isAgentOrAdmin = user?.role === 'ADMIN' || user?.role === 'AGENT';

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <button onClick={() => navigate('/tickets')} className="text-sm text-primary-600 hover:text-primary-700">
        ← Back to Tickets
      </button>

      {/* Header card */}
      <div className="card">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="text-sm font-mono text-gray-400">{ticket.ticketNumber}</span>
              <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${statusColor[ticket.status] ?? 'bg-gray-100 text-gray-800'}`}>
                {ticket.status.replace(/_/g, ' ')}
              </span>
              <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${priorityColor[ticket.priority] ?? 'bg-gray-100 text-gray-800'}`}>
                {ticket.priority}
              </span>
              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                {ticket.category.replace(/_/g, ' ')}
              </span>
            </div>
            {isEditing ? (
              <div className="space-y-2">
                <input
                  className="input text-xl font-bold w-full"
                  value={editData.title}
                  onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                />
                <textarea
                  className="input w-full"
                  rows={4}
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                />
              </div>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">{ticket.title}</h1>
                <p className="text-gray-600 whitespace-pre-wrap">{ticket.description}</p>
              </>
            )}
          </div>
          <div className="flex gap-2 ml-4 flex-shrink-0">
            {canEdit && !isEditing && (
              <button onClick={() => { setEditData({ title: ticket.title, description: ticket.description }); setIsEditing(true); }} className="btn btn-outline text-sm">Edit</button>
            )}
            {isEditing && (
              <>
                <button onClick={() => setIsEditing(false)} className="btn btn-outline text-sm">Cancel</button>
                <button onClick={() => updateMutation.mutate(editData)} className="btn btn-primary text-sm" disabled={updateMutation.isPending}>
                  {updateMutation.isPending ? 'Saving…' : 'Save'}
                </button>
              </>
            )}
          </div>
        </div>

        {ticket.aiSummary && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
            <span className="font-semibold">AI Summary: </span>{ticket.aiSummary}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t mt-4 text-sm">
          <div><p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Created by</p><p className="font-medium">{ticket.createdBy.firstName} {ticket.createdBy.lastName}</p></div>
          <div><p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Assigned to</p><p className="font-medium">{ticket.assignedTo ? `${ticket.assignedTo.firstName} ${ticket.assignedTo.lastName}` : 'Unassigned'}</p></div>
          <div><p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Created</p><p className="font-medium">{new Date(ticket.createdAt).toLocaleDateString()}</p></div>
          <div><p className="text-gray-400 text-xs uppercase tracking-wide mb-0.5">Updated</p><p className="font-medium">{new Date(ticket.updatedAt).toLocaleDateString()}</p></div>
        </div>
      </div>

      {/* Status actions — agents/admins */}
      {isAgentOrAdmin && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Change status</h3>
          <div className="flex flex-wrap gap-2">
            {(['OPEN', 'PENDING', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => updateMutation.mutate({ status: s })}
                disabled={ticket.status === s || updateMutation.isPending}
                className={`btn text-xs py-1.5 px-3 ${ticket.status === s ? 'btn-primary' : 'btn-outline'}`}
              >
                {s.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Conversation */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Conversation</h3>

        {messagesLoading ? (
          <div className="flex justify-center py-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>
        ) : messages.length === 0 ? (
          <div className="text-center py-10 bg-gray-50 rounded-lg">
            <p className="text-gray-500 text-sm">No messages yet. Be the first to reply.</p>
          </div>
        ) : (
          <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
            {messages.map((msg) => {
              const isMine = msg.user.id === user?.id;
              return (
                <div key={msg.id} className={`flex gap-3 ${isMine ? 'flex-row-reverse' : ''}`}>
                  {/* Avatar */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">
                    {msg.user.firstName[0]}{msg.user.lastName[0]}
                  </div>
                  <div className={`max-w-[75%] ${isMine ? 'items-end' : 'items-start'} flex flex-col`}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-700">{msg.user.firstName} {msg.user.lastName}</span>
                      <span className="text-xs text-gray-400">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      {msg.isInternal && <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded">Internal</span>}
                      {msg.isAIGenerated && <span className="text-xs px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded">AI</span>}
                    </div>
                    <div className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap ${
                      msg.isInternal
                        ? 'bg-yellow-50 border border-yellow-200 text-yellow-900'
                        : isMine
                          ? 'bg-primary-600 text-white rounded-tr-sm'
                          : 'bg-gray-100 text-gray-800 rounded-tl-sm'
                    }`}>
                      {msg.message}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        )}

        {/* Reply box */}
        {ticket.status !== 'CLOSED' && (
          <div className="mt-6 border-t pt-4 space-y-3">
            {isAgentOrAdmin && (
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                    className="rounded border-gray-300 text-primary-600"
                  />
                  Internal note (not visible to customer)
                </label>
                <button
                  onClick={handleAiDraft}
                  disabled={aiDrafting}
                  className="ml-auto text-sm text-primary-600 hover:text-primary-700 disabled:opacity-50 font-medium"
                >
                  {aiDrafting ? 'Drafting…' : '✨ AI Draft'}
                </button>
              </div>
            )}
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={4}
              placeholder={isInternal ? 'Add an internal note…' : 'Write a reply…'}
              className={`input resize-none ${isInternal ? 'border-yellow-300 bg-yellow-50' : ''}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendReply();
              }}
            />
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-400">Ctrl+Enter to send</span>
              <button
                onClick={handleSendReply}
                disabled={!replyText.trim() || replyMutation.isPending}
                className="btn btn-primary text-sm"
              >
                {replyMutation.isPending ? 'Sending…' : isInternal ? 'Add Note' : 'Send Reply'}
              </button>
            </div>
          </div>
        )}
        {ticket.status === 'CLOSED' && (
          <p className="mt-4 text-center text-sm text-gray-500 border-t pt-4">This ticket is closed.</p>
        )}
      </div>
    </div>
  );
};
