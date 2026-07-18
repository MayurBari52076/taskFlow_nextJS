import { io } from 'socket.io-client';

let socket;

export function getSocket() {
  const token = typeof window !== 'undefined' ? window.localStorage.getItem('taskflow-token') : null;

  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL, {
      auth: { token },
      autoConnect: false,
    });
  } else {
    socket.auth = { token };
  }

  return socket;
}
