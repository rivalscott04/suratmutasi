// Helper API untuk request ke backend dengan JWT
import { useAuth } from '@/contexts/AuthContext';

// Environment configuration - simplified
const getBaseUrl = () => {
  const hostname = window.location.hostname;
  const href = window.location.href;
  
  // Debug logging
  console.log(' API Base URL Detection:', {
    envVar: import.meta.env.VITE_API_URL,
    hostname,
    protocol: window.location.protocol,
    href,
    mode: import.meta.env.MODE
  });
  
  // PRIORITY 1: If frontend and backend are on the same server (path-based routing)
  // Use relative URL to avoid CORS issues completely
  if (hostname === '103.41.207.103' || hostname.includes('103.41.207.103')) {
    console.log(' Frontend and backend on same server, using relative URL (no CORS needed)');
    return ''; // Empty string = relative URL, will use /api/... directly
  }
  
  // PRIORITY 2: Use environment variable if set (but not for same-server deployment)
  let apiUrl = import.meta.env.VITE_API_URL;
  if (apiUrl && apiUrl.trim() !== '') {
    const currentProtocol = window.location.protocol;
    const apiProtocol = apiUrl.startsWith('https://') ? 'https:' : 'http:';
    
    // If protocols don't match and we're on HTTP, try to use HTTP version
    if (currentProtocol === 'http:' && apiProtocol === 'https:') {
      apiUrl = apiUrl.replace('https://', 'http://');
      console.warn(' Protocol mismatch detected, using HTTP version:', apiUrl);
    } else {
      console.log(' Using VITE_API_URL:', apiUrl);
    }
    return apiUrl;
  }
  
  // PRIORITY 3: Localhost fallback
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    console.log(' Using localhost fallback');
    return 'http://localhost:3000';
  }

  // PRIORITY 4: Default fallback - use relative URL for same-origin
  console.log(' Using relative URL (same-origin, no CORS)');
  return ''; // Empty string = relative URL
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
  
  const baseUrl = getBaseUrl();
  const fullUrl = baseUrl + url;
  
  // Log the request for debugging
  console.log(' API Request:', {
    method,
    url,
    fullUrl,
    baseUrl,
    hasToken: !!token
  });
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

  // Try fetch with error handling for CORS and redirects
  let res;
  try {
    res = await fetch(fullUrl, {
      ...fetchOptions,
      redirect: 'follow', // Follow redirects automatically
    });
  } catch (fetchError: any) {
    // If CORS error and we're using HTTP, try HTTPS version
    if (fetchError.message?.includes('CORS') || fetchError.message?.includes('Failed to fetch')) {
      if (fullUrl.startsWith('http://')) {
        const httpsUrl = fullUrl.replace('http://', 'https://');
        console.warn(' CORS error with HTTP, trying HTTPS:', httpsUrl);
        try {
          res = await fetch(httpsUrl, fetchOptions);
        } catch (httpsError) {
          throw fetchError; // Throw original error
        }
      } else {
        throw fetchError;
      }
    } else {
      throw fetchError;
    }
  }
  
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
      // Jika refresh gagal, coba lagi sekali dengan delay
      console.log(' Token refresh failed, retrying once...');
      try {
        await new Promise(resolve => setTimeout(resolve, 500));
        const retryRefreshRes = await fetch(getBaseUrl() + '/api/auth/refresh', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
        });
        
        if (retryRefreshRes.ok) {
          const retryRefreshData = await retryRefreshRes.json();
          if (retryRefreshData.token) {
            localStorage.setItem('token', retryRefreshData.token);
            if (window.dispatchTokenUpdate) {
              window.dispatchTokenUpdate(retryRefreshData.token);
            }
            // Retry request dengan token baru
            fetchOptions.headers = {
              ...fetchOptions.headers,
              Authorization: `Bearer ${retryRefreshData.token}`,
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
      } catch (retryError) {
        console.log(' Retry refresh also failed:', retryError);
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
    // Better error handling for 404
    if (res.status === 404) {
      const errorMsg = responseData?.message || 'Endpoint tidak ditemukan';
      console.error(' 404 Not Found:', {
        url: fullUrl,
        method,
        status: res.status,
        responseData
      });
      throw new Error(errorMsg);
    }
    
    // For other errors, use the message from response or status text
    const errorMsg = responseData?.message || responseData || res.statusText || 'Terjadi kesalahan';
    console.error(' API Error:', {
      url: fullUrl,
      method,
      status: res.status,
      error: errorMsg
    });
    throw new Error(errorMsg);
  }
  return responseData;
}

export const apiGet = (url: string, token?: string, headers?: any) => apiFetch('GET', url, { token, headers });
export const apiPost = (url: string, data?: any, token?: string, headers?: any) => apiFetch('POST', url, { data, token, headers });
export const apiPut = (url: string, data?: any, token?: string, headers?: any) => apiFetch('PUT', url, { data, token, headers });
export const apiDelete = (url: string, token?: string, headers?: any) => apiFetch('DELETE', url, { token, headers });

// API function untuk replace file (mendukung refresh token pada 401/403 agar tidak langsung popup sesi berakhir)
export const replaceFile = async (pengajuanId: string, fileId: string, file: File, token: string, userRole: string, fileCategory?: string) => {
  const doPut = async (jwt: string): Promise<Response> => {
    const formData = new FormData();
    formData.append('file', file);
    let baseUrl = '/api';
    if (userRole === 'admin_wilayah') {
      baseUrl = '/api/admin-wilayah';
    } else if (userRole === 'admin') {
      baseUrl = fileCategory === 'admin_wilayah' ? '/api/admin-wilayah' : '/api';
    }
    const url = `${baseUrl}/pengajuan/${pengajuanId}/files/${fileId}/replace`;
    const fullUrl = getBaseUrl() + url;
    return fetch(fullUrl, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${jwt}` },
      body: formData,
      credentials: 'include',
    });
  };

  let response = await doPut(token);
  console.log(' Replace file response status:', response.status);

  // 401/403: coba refresh token lalu retry sekali dengan FormData baru
  if ((response.status === 401 || response.status === 403) && token) {
    try {
      await new Promise(r => setTimeout(r, 100));
      const refreshRes = await fetch(getBaseUrl() + '/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (refreshRes.ok) {
        const refreshData = await refreshRes.json();
        if (refreshData.token) {
          localStorage.setItem('token', refreshData.token);
          if (typeof window !== 'undefined' && (window as any).dispatchTokenUpdate) {
            (window as any).dispatchTokenUpdate(refreshData.token);
          }
          response = await doPut(refreshData.token);
          console.log(' Replace file retry response status:', response.status);
        }
      }
    } catch (refreshErr) {
      console.log(' Replace file refresh failed:', refreshErr);
    }
  }

  const contentType = response.headers.get('content-type');
  const result = contentType?.includes('application/json')
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && typeof window !== 'undefined' && (window as any).showSessionExpiredModal) {
      (window as any).showSessionExpiredModal();
    }
    const msg = typeof result === 'object' && result?.message ? result.message : 'Gagal mengganti file';
    throw new Error(msg);
  }

  return typeof result === 'object' ? result : { success: true };
}; 