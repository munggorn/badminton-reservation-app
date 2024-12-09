import axios from 'axios';
import io from 'socket.io-client';

const BASE_URL = 'https://badminton-reservation-59c4db5dc0dc.herokuapp.com';
const API_URL = `${BASE_URL}/api`;

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const socket = io(BASE_URL, {
  withCredentials: true,
  reconnectionDelay: 1000,
  reconnection: true,
  reconnectionAttempts: 10,
  transports: ['websocket'],
  agent: false,
  upgrade: false,
  rejectUnauthorized: false
});

export const getCourts = () => api.get('/courts');
export const createReservation = (reservationData) => api.post('/reservations', reservationData);
export const getReservations = () => api.get('/reservations');

api.interceptors.response.use(
  response => response,
  error => {
    console.error("API Error:", error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

export default api;
