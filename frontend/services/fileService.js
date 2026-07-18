import api from './api';

export const listFiles = (taskId) =>
  api.get('/files', { params: { task: taskId } }).then((res) => res.data.data);

export const uploadFile = (taskId, file) => {
  const formData = new FormData();
  formData.append('task', taskId);
  formData.append('file', file);
  return api
    .post('/files', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
    .then((res) => res.data.data);
};

export const deleteFile = (id) => api.delete(`/files/${id}`).then((res) => res.data);
