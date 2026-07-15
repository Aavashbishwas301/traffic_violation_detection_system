/**
 * API Configuration
 *
 * Centralized API base URL configuration.
 * In development, uses VITE_API_URL from .env or falls back to localhost.
 * In production, set VITE_API_URL to your backend URL.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}/api/users/login`,
  REGISTER: `${API_BASE_URL}/api/users`,
  PROFILE: `${API_BASE_URL}/api/users/profile`,

  // Violations
  VIOLATIONS: `${API_BASE_URL}/api/violations`,
  MY_VIOLATIONS: `${API_BASE_URL}/api/violations/my`,
  UPLOAD_VIOLATION: `${API_BASE_URL}/api/violations/upload`,
  MANUAL_VIOLATION: `${API_BASE_URL}/api/violations/manual`,

  // Vehicles
  VEHICLES: `${API_BASE_URL}/api/vehicles`,
  MY_VEHICLES: `${API_BASE_URL}/api/vehicles/my`,

  // Payments
  KHALTI_INITIATE: `${API_BASE_URL}/api/payments/khalti/initiate`,
  KHALTI_VERIFY: `${API_BASE_URL}/api/payments/khalti/verify`,
  ESEWA_INITIATE: `${API_BASE_URL}/api/payments/esewa/initiate`,
  ESEWA_VERIFY: `${API_BASE_URL}/api/payments/esewa/verify`,

  // Admin
  ADMIN_STATS: `${API_BASE_URL}/api/admin/stats`,
  ADMIN_USERS: `${API_BASE_URL}/api/admin/users`,
  ADMIN_VEHICLES: `${API_BASE_URL}/api/admin/vehicles`,
  ADMIN_RULES: `${API_BASE_URL}/api/admin/rules`,
  ADMIN_NOTIFICATIONS: `${API_BASE_URL}/api/admin/notifications`,
  ADMIN_REPORT: `${API_BASE_URL}/api/admin/report`,
  ADMIN_COMPLAINTS: `${API_BASE_URL}/api/admin/complaints`,
  ADMIN_BROADCAST: `${API_BASE_URL}/api/admin/broadcast`,
  ADMIN_OFFICERS: `${API_BASE_URL}/api/admin/officers`,
  ADMIN_UNREGISTERED_VEHICLES: `${API_BASE_URL}/api/admin/vehicles/unregistered`,
  ADMIN_REPORTS: `${API_BASE_URL}/api/admin/reports`,
};

export default API_BASE_URL;
