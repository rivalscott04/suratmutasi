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

  // Production default: use same-origin with relative path (to be reverse-proxied, e.g., /api)
  // This avoids mixed content when the app is served over HTTPS
  return '';
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
  
  const fullUrl = getBaseUrl() + url;
  const fetchOptions: RequestInit = {
    method,
    headers: {
      ...headers,
    },
    credentials: 'include', // penting agar cookie refresh token dikirim
  };

  if (token) {
    fetchOptions.headers = {
      ...fetchOptions.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  if (data) {
    // Jika data adalah FormData, biarkan browser set Content-Type boundary otomatis
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      fetchOptions.body = data as any;
    } else {
      fetchOptions.headers = {
        'Content-Type': 'application/json',
        ...fetchOptions.headers,
      };
      fetchOptions.body = JSON.stringify(data);
    }
  }

  let res = await fetch(fullUrl, fetchOptions);
  let contentType = res.headers.get('content-type');
  let responseData;

  if (contentType && contentType.includes('application/json')) {
    responseData = await res.json();
  } else {
    responseData = await res.text();
  }
  
  // Handle authentication errors (401) and authorization errors (403) that might indicate session expiry
  // Hanya handle jika bukan endpoint auth dan bukan request yang sudah di-retry
  if ((res.status === 401 || res.status === 403) && 
      url !== '/api/auth/refresh' && 
      url !== '/api/auth/me' && // Jangan retry /api/auth/me untuk mencegah infinite loop
      !url.includes('/api/auth/')) {
    
    try {
      // Tambah delay kecil untuk mencegah race condition
      await new Promise(resolve => setTimeout(resolve, 100));
      
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
      // Pastikan error message konsisten
      const errorMessage = err instanceof Error ? err.message : 'Sesi berakhir, silakan login kembali';
      if (window.showSessionExpiredModal) {
        window.showSessionExpiredModal();
      }
      throw new Error(errorMessage);
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