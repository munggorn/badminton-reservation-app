import axios from 'axios';
import io from 'socket.io-client';

const BASE_URL = 'https://badminton-reservation-59c4db5dc0dc.herokuapp.com';
const API_URL = `${BASE_URL}/api`;

// Create axios instance with enhanced configuration
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
  // Add retry logic
  retry: 3,
  retryDelay: (retryCount) => {
    return retryCount * 1000; // Time interval between retries
  }
});

// Enhanced socket configuration
export const socket = io(BASE_URL, {
  withCredentials: true,
  reconnectionDelay: 1000,
  reconnection: true,
  reconnectionAttempts: 10,
  transports: ['websocket'],
  agent: false,
  upgrade: false,
  rejectUnauthorized: false,
  autoConnect: true,
  // Add error handling for connection
  connectionStateRecovery: {
    maxDisconnectionDuration: 2000,
    skipMiddlewares: true,
  }
});

// Socket connection monitoring
socket.on('connect', () => {
  console.log('Socket Connected:', socket.id);
});

socket.on('disconnect', (reason) => {
  console.log('Socket Disconnected:', reason);
});

socket.on('error', (error) => {
  console.error('Socket Error:', error);
});

socket.on('connect_error', (error) => {
  console.error('Socket Connection Error:', error);
});

// Enhanced API endpoints with better error handling
export const getCourts = async () => {
  try {
    const response = await api.get('/courts');
    console.log('Courts fetched successfully:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching courts:', error);
    throw error;
  }
};

export const createReservation = async (reservationData) => {
  console.log('Creating reservation:', reservationData);
  try {
    const response = await api.post('/reservations', reservationData);
    console.log('Reservation created successfully:', response.data);
    
    // Emit socket event for real-time updates
    socket.emit('newReservation', response.data);
    
    return response;
  } catch (error) {
    console.error('Reservation creation error:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
};

export const getReservations = async () => {
  try {
    const response = await api.get('/reservations');
    console.log('Reservations fetched successfully:', response.data);
    return response;
  } catch (error) {
    console.error('Error fetching reservations:', error);
    throw error;
  }
};

// Enhanced axios interceptors
api.interceptors.request.use(
  config => {
    console.log('API Request:', {
      method: config.method,
      url: config.url,
      data: config.data,
      headers: config.headers
    });
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(undefined, async (err) => {
  const { config } = err;
  if (!config || !config.retry) {
    return Promise.reject(err);
  }
  
  config.__retryCount = config.__retryCount || 0;
  
  if (config.__retryCount >= config.retry) {
    return Promise.reject(err);
  }
  
  config.__retryCount += 1;
  console.log(`Retrying request (${config.__retryCount}/${config.retry})`);
  
  const backoff = new Promise(resolve => {
    setTimeout(() => {
      resolve();
    }, config.retryDelay(config.__retryCount));
  });
  
  await backoff;
  return api(config);
});

export default api;
