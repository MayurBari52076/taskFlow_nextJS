import api from './api';

export const updateProfile = (payload) => api.patch('/users/me', payload).then((res) => res.data.data);

export const changePassword = (payload) => api.patch('/users/me/password', payload).then((res) => res.data);
