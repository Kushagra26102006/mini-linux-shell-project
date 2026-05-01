// Single shared socket instance used by both App and Terminal
import { io } from 'socket.io-client';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
export const socket = io(BACKEND_URL);
