// apis.js
import axios from 'axios';

const API_URL = import.meta.env.VITE_REACT_APP_API_URL || 'http://localhost:5000';

// ── 1. Create the instance FIRST ──
const api = axios.create({
    baseURL: API_URL,
    timeout: 60000,
    withCredentials: true,   // sends the httpOnly auth cookie cross-origin
});

// ── 2. 401 → auto-logout plumbing (used by AuthContext) ──
let unauthorizedHandler = null;
export const setUnauthorizedHandler = (fn) => {
    unauthorizedHandler = fn || null;
};

// ── 3. Attach the JWT from localStorage ──
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        } else {
            delete config.headers.Authorization;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// ── 4. Wake-state tracking (count in-flight requests) ──
let pending = 0;
let slowTimer = null;
const listeners = new Set();
const emit = (isSlow) => listeners.forEach((fn) => fn(isSlow));

export const subscribeWakeState = (fn) => {
    listeners.add(fn);
    return () => listeners.delete(fn);
};

api.interceptors.request.use((config) => {
    pending++;
    if (pending === 1) {
        slowTimer = setTimeout(() => emit(true), 4000);
    }
    return config;
});

const done = () => {
    pending = Math.max(0, pending - 1);
    if (pending === 0) {
        clearTimeout(slowTimer);
        emit(false);
    }
};

// ── 5. Response interceptors: wake-done runs on every response… ──
api.interceptors.response.use(
    (res) => { done(); return res; },
    (err) => { done(); return Promise.reject(err); }
);

// ── 6. …and expired tokens trigger the logout handler ──
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401 && typeof unauthorizedHandler === 'function') {
            unauthorizedHandler();
        }
        return Promise.reject(error);
    }
);

export default api;