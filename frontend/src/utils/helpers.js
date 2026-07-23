import api from './axios.js';

export const resolveImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  return `${api.defaults.baseURL}/${path.replace(/\\/g, '/')}`;
};
