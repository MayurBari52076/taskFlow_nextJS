import api from './api';

export const getMessages = (taskId) =>
  api.get('/chat', { params: { task: taskId } }).then((res) => res.data.data);
