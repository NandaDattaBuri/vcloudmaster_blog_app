// Backend base URL. Override per environment with VITE_API_URL in a .env file.
export const API_BASE_URL = (
  import.meta.env.VITE_API_URL || 'http://localhost:5000'
).replace(/\/+$/, '');

export const SITE_NAME = 'VCloudMaster Blog';
export const SITE_DESCRIPTION =
  'Cloud, DevOps and engineering insights from the VCloudMaster team.';
export const LOGO_URL = 'https://www.vcloudmaster.com/assets/logo_3-CaoEdpo9.png';
export const MAIN_SITE_URL = 'https://www.vcloudmaster.com';

export const MAX_IMAGE_BYTES = 4 * 1024 * 1024; // matches the backend (AWS Lambda payload limit)
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/avif'];
