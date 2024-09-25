import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'https://badminton-reservation-backend.onrender.com/api';
const SOCKET_URL = 'https://badminton-reservation-backend.onrender.com';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // This is important for CORS with credentials
  headers: {
    'Content-Type': 'application/json',
  },
});

export const socket = io(SOCKET_URL, {
  withCredentials: true, // This matches the CORS setting on the server
});

export const getCourts = () => api.get('/courts');
export const createReservation = (reservationData) => api.post('/reservations', reservationData);
export const getReservations = () => api.get('/reservations');

// Add error interceptor
api.interceptors.response.use(
  response => response,
  error => {
    console.error("API Error:", error.response ? error.response.data : error.message);
    return Promise.reject(error);
  }
);

export default api;
