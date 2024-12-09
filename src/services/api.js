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

export const createReservation = async (reservationData) => {
  console.log('Sending reservation data to API:', reservationData);
  try {
    const response = await api.post('/reservations', reservationData);
    console.log('Reservation response:', response.data);
    return response;
  } catch (error) {
    console.error('Reservation error details:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const getReservations = () => api.get('/reservations');

api.interceptors.response.use(
  response => response,
  error => {
    console.error("API Error:", {
      message: error.message,
      data: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });
    return Promise.reject(error);
  }
);

export default api;
