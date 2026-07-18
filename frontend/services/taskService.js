import api from './api';

export const getTasks = (params = {}) => api.get('/tasks', { params }).then((res) => res.data.data);

export const getTask = (id) => api.get(`/tasks/${id}`).then((res) => res.data.data);

export const createTask = (payload) => api.post('/tasks', payload).then((res) => res.data.data);

export const updateTask = (id, payload) => api.patch(`/tasks/${id}`, payload).then((res) => res.data.data);

export const deleteTask = (id) => api.delete(`/tasks/${id}`).then((res) => res.data);
