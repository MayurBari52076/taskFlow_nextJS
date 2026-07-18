import api from './api';

export const listInvitations = (taskId) =>
  api.get('/invitations', { params: { task: taskId } }).then((res) => res.data.data);

export const createInvitation = (payload) => api.post('/invitations', payload).then((res) => res.data);

export const acceptInvitation = (token) => api.get(`/invitations/accept/${token}`).then((res) => res.data);

export const revokeInvitation = (id) => api.delete(`/invitations/${id}`).then((res) => res.data);
