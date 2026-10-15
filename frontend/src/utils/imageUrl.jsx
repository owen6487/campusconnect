const API_BASE_URL = import.meta.env.VITE_REACT_APP_API_URL;
const SERVER_ORIGIN = API_BASE_URL.replace(/\/api\/?$/, '');
export const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=900&q=80';
 

export const getImageUrl = (image) => {
  if (!image) return FALLBACK_IMAGE;
  if (image.startsWith('http://') || image.startsWith('https://')) return image;
  if (image.startsWith('/')) return `${SERVER_ORIGIN}${image}`;
  return `${SERVER_ORIGIN}/uploads/${image}`;
};
export const useFallback = (e) => {
  e.target.onerror = null;
  e.target.src = FALLBACK_IMAGE;
};
 