import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'https://badmindton-reservation-backend-48221d08d8e7.herokuapp.com/api'; // Replace with your Heroku app URL
const SOCKET_URL = 'https://badmindton-reservation-backend-48221d08d8e7.herokuapp.com/'; // Replace with your Heroku app URL

const api = axios.create({
  baseURL: API_URL,
});

export const socket = io(SOCKET_URL);

export const getCourts = () => api.get('/courts');
export const createReservation = (reservationData) => api.post('/reservations', reservationData);
export const getReservations = () => api.get('/reservations');

export default api;