/**
 * HTTP Client for API requests with OAuth 2.0 Client Credentials
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

/**
 * Base URL for API requests
 */
const BASE_URL = process.env.API_BASE_URL || 'https://api-performance.ozon.ru:443';
const CLIENT_ID = process.env.OZON_CLIENT_ID;
const CLIENT_SECRET = process.env.OZON_CLIENT_SECRET;

/**
 * OAuth token cache
 */
let accessToken: string | null = null;
let tokenExpiresAt: number = 0;
let tokenRefreshPromise: Promise<string> | null = null;

/**
 * Separate axios instance for OAuth token requests (no interceptors)
 */
const tokenClient = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get OAuth access token using Client Credentials flow
 */
async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60 second buffer)
  if (accessToken && Date.now() < tokenExpiresAt - 60000) {
    return accessToken;
  }

  // If token refresh is already in progress, wait for it
  if (tokenRefreshPromise) {
    return tokenRefreshPromise;
  }

  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('Missing OZON_CLIENT_ID or OZON_CLIENT_SECRET environment variables');
  }

  // Start token refresh
  tokenRefreshPromise = (async () => {
    try {
      const response = await tokenClient.post('/api/client/token', {
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        grant_type: 'client_credentials',
      });

      accessToken = response.data.access_token;
      const expiresIn = response.data.expires_in || 1800; // Default 30 minutes
      tokenExpiresAt = Date.now() + (expiresIn * 1000);

      if (!accessToken) {
        throw new Error('Access token not received from OAuth server');
      }

      return accessToken;
    } catch (error: any) {
      throw new Error(`OAuth token request failed: ${error.message}`);
    } finally {
      tokenRefreshPromise = null;
    }
  })();

  return tokenRefreshPromise;
}

/**
 * Create configured axios instance WITHOUT interceptors
 * Token will be added manually in wrapper methods
 */
function createHttpClient(): AxiosInstance {
  const instance = axios.create({
    baseURL: BASE_URL,
    timeout: 30000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  return instance;
}

// Base axios instance (no interceptors)
const baseClient = createHttpClient();

/**
 * HTTP Client wrapper with manual OAuth token injection
 */
export const httpClient = {
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const token = await getAccessToken();
    const headers = { ...config?.headers, Authorization: `Bearer ${token}` };
    // Use exploded array serialization for OpenAPI spec compliance
    const paramsSerializer = { indexes: null };
    const response = await baseClient.get<T>(url, { ...config, headers, paramsSerializer });
    return response.data;
  },

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const token = await getAccessToken();
    const headers = { ...config?.headers, Authorization: `Bearer ${token}` };
    const response = await baseClient.post<T>(url, data, { ...config, headers });
    return response.data;
  },

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const token = await getAccessToken();
    const headers = { ...config?.headers, Authorization: `Bearer ${token}` };
    const response = await baseClient.put<T>(url, data, { ...config, headers });
    return response.data;
  },

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const token = await getAccessToken();
    const headers = { ...config?.headers, Authorization: `Bearer ${token}` };
    const response = await baseClient.patch<T>(url, data, { ...config, headers });
    return response.data;
  },

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const token = await getAccessToken();
    const headers = { ...config?.headers, Authorization: `Bearer ${token}` };
    const response = await baseClient.delete<T>(url, { ...config, headers });
    return response.data;
  },
};
