import api from './api';

export const getActivity = (taskId) =>
  api.get('/activity', { params: taskId ? { task: taskId } : {} }).then((res) => res.data.data);
