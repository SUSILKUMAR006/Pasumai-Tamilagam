import { API_BASE_URL } from '../config';

const API_ORIGIN = API_BASE_URL;

// Cloudinary (and any future host) already returns an absolute URL; only
// legacy local-disk uploads (`/uploads/...`) need the backend origin prefixed.
export const getImageUrl = (path) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_ORIGIN}${path}`;
};
