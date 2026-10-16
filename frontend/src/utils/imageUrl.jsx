const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_SERVER_URL ||
  import.meta.env.VITE_REACT_API_URL ||
  import.meta.env.VITE_SITE_URL ||
  'https://api.campusconnect.co.ke';

const SERVER_ORIGIN = String(API_BASE_URL).replace(/\/$/, '').replace(/\/api\/?$/, '');

export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80';

export const getImageUrl = (image) => {
  if (!image || typeof image !== 'string') return FALLBACK_IMAGE;

  const value = image.trim();
  if (!value) return FALLBACK_IMAGE;
  if (/^https?:\/\//i.test(value)) return value;

  const clean = value.replace(/^\/+/g, '').replace(/^uploads\//i, '');

  if (value.startsWith('/')) {
    return `${SERVER_ORIGIN}/${clean}`;
  }

  if (clean.startsWith('uploads/')) {
    return `${SERVER_ORIGIN}/${clean}`;
  }

  return `${SERVER_ORIGIN}/uploads/${clean}`;
};

export const useFallback = (e) => {
  e.target.onerror = null;
  e.target.src = FALLBACK_IMAGE;
};
 