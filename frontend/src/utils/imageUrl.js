const API_ORIGIN = 'http://localhost:5000';

// Cloudinary (and any future host) already returns an absolute URL; only
// legacy local-disk uploads (`/uploads/...`) need the backend origin prefixed.
export const getImageUrl = (path) => {
  if (!path) return '';
  return path.startsWith('http') ? path : `${API_ORIGIN}${path}`;
};
