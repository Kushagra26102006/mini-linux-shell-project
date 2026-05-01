# Deployment Guide: Mini Linux Shell

This guide explains how to deploy the Mini Linux Shell project to production.

## 1. Prepare Backend (Render or Railway)

The backend is a Node.js application that handles virtual file system logic and Socket.io communication.

### Steps for Render:
1. **Create a Web Service**: Connect your GitHub repository.
2. **Build Settings**:
   - **Root Directory**: `backend` (if you push the whole repo, or set it to where `package.json` is).
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
3. **Environment Variables**:
   - `PORT`: `5001` (Render will usually provide its own, our code handles `process.env.PORT`).
   - `NODE_ENV`: `production`

### Steps for Railway:
1. **New Project**: Connect GitHub repo.
2. **Settings**:
   - Railway will automatically detect the `backend` folder if you point it there.
   - It will use `npm start` automatically.
3. **Variable**: `PORT` is automatically managed.

---

## 2. Prepare Frontend (Vercel)

The frontend is a Vite + React application.

### Steps for Vercel:
1. **New Project**: Import your GitHub repository.
2. **Project Settings**:
   - **Root Directory**: `frontend`
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   - `VITE_BACKEND_URL`: The URL of your deployed backend (e.g., `https://your-backend.onrender.com`).
     - **Important**: Do NOT include a trailing slash.

---

## 3. Production Workflow Summary

### Local Changes Check:
Before deploying, ensure your `frontend/src/socket.js` looks like this:
```javascript
import { io } from 'socket.io-client';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
export const socket = io(BACKEND_URL);
```

### Build & Deploy:
1. **Push to GitHub**: Both frontend and backend folders should be in your repository.
2. **Automatic Deploys**: Once connected, Vercel and Render/Railway will redeploy whenever you push to the `main` branch.

## 4. Troubleshooting
- **CORS Errors**: If the frontend cannot connect to the backend, ensure the backend's `server.js` allows the Vercel URL. Currently, it uses `origin: "*"` which is fine for general use, but you can tighten it by setting `origin: "https://your-frontend.vercel.app"`.
- **WebSocket Connection**: If WebSockets fail, ensure you are using `https://` in your `VITE_BACKEND_URL`.
