import { io, Socket } from 'socket.io-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:5000';

let socket: Socket | null = null;

export function getSocket(): Socket | null {
  return socket;
}

export function connectSocket(token: string): Socket {
  if (socket?.connected) return socket;

  socket = io(WS_URL, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  socket.on('connect', () => {
    console.debug('[Socket] Connected:', socket?.id);
  });

  socket.on('connect_error', (err) => {
    console.warn('[Socket] Connection error:', err.message);
  });

  socket.on('disconnect', (reason) => {
    console.debug('[Socket] Disconnected:', reason);
  });

  return socket;
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export function joinTicketRoom(ticketId: string): void {
  socket?.emit('join:ticket', ticketId);
}

export function leaveTicketRoom(ticketId: string): void {
  socket?.emit('leave:ticket', ticketId);
}
