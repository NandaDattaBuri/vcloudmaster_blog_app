import client from './client';

const data = (request) => request.then((response) => response.data);

export const login = (email, password) => data(client.post('/admin/login', { email, password }));
export const register = (details) => data(client.post('/admin/register', details));
export const fetchMe = () => data(client.get('/admin/me'));
export const fetchRegistrationStatus = () => data(client.get('/admin/registration-status'));
