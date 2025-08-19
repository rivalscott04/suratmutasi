// Helper API untuk request ke backend dengan JWT
import { useAuth } from '@/contexts/AuthContext';

// Environment configuration - simplified
const getBaseUrl = () => {
  // Use environment variable if available, otherwise detect based on hostname
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (apiUrl) {
    return apiUrl;
  }
  
  // Fallback: detect based on hostname
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:3001';
  }
  
  return 'https://bemutasi.rivaldev.site';
};

// Get current environment for logging
const getCurrentEnvironment = () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  
  if (apiUrl) {
    return apiUrl.includes('localhost') ? 'development' : 'production';
  }
  
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'development' 
    : 'production';
};

export async function apiFetch(method: string, url: string, options: { data?: any; token?: string; headers?: any } = {}) {
  const { data, token, headers = {} } = options;
  const BASE_URL = getBaseUrl();
  const fullUrl = url.startsWith('http') ? url : BASE_URL + url;
  
  console.log(`🌐 API Request to: ${fullUrl} (${getCurrentEnvironment()})`);
  console.log(`🔧 Base URL: ${BASE_URL}, Environment: ${getCurrentEnvironment()}, Hostname: ${window.location.hostname}`);
  
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    credentials: 'include', // penting agar cookie refresh token dikirim
  };
  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }
  let res = await fetch(fullUrl, fetchOptions);
  let contentType = res.headers.get('content-type');
  let responseData;
  if (contentType && contentType.includes('application/json')) {
    responseData = await res.json();
  } else {
    responseData = await res.text();
  }
  // Jika token expired/401, coba refresh token
  if (res.status === 401 && url !== '/api/auth/refresh') {
    try {
      const refreshRes = await fetch(getBaseUrl() + '/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.token) {
          localStorage.setItem('token', refreshData.token);
          // Update AuthContext jika ada
          if (window.dispatchTokenUpdate) {
            window.dispatchTokenUpdate(refreshData.token);
          }
          // Retry request dengan token baru
          fetchOptions.headers = {
            ...fetchOptions.headers,
            Authorization: `Bearer ${refreshData.token}`,
          };
          res = await fetch(fullUrl, fetchOptions);
          contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            responseData = await res.json();
          } else {
            responseData = await res.text();
          }
          if (!res.ok) throw new Error(responseData?.message || res.statusText);
          return responseData;
        }
      }
      // Jika refresh gagal, trigger modal sesi berakhir global
      if (window.showSessionExpiredModal) {
        window.showSessionExpiredModal();
      }
      throw new Error('Sesi berakhir, silakan login kembali');
    } catch (err) {
      if (window.showSessionExpiredModal) {
        window.showSessionExpiredModal();
      }
      throw new Error('Sesi berakhir, silakan login kembali');
    }
  }
  if (!res.ok) {
    throw new Error(responseData?.message || res.statusText);
  }
  return responseData;
}

export const apiGet = (url: string, token?: string, headers?: any) => apiFetch('GET', url, { token, headers });
export const apiPost = (url: string, data?: any, token?: string, headers?: any) => apiFetch('POST', url, { data, token, headers });
export const apiPut = (url: string, data?: any, token?: string, headers?: any) => apiFetch('PUT', url, { data, token, headers });
export const apiDelete = (url: string, token?: string, headers?: any) => apiFetch('DELETE', url, { token, headers }); 