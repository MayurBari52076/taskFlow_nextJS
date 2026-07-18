import api from './api';

export const getSubtasks = (taskId) =>
  api.get('/subtasks', { params: { task: taskId } }).then((res) => res.data.data);

export const createSubtask = (payload) => api.post('/subtasks', payload).then((res) => res.data.data);

export const updateSubtask = (id, payload) => api.patch(`/subtasks/${id}`, payload).then((res) => res.data.data);

export const deleteSubtask = (id) => api.delete(`/subtasks/${id}`).then((res) => res.data);
