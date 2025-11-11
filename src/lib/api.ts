// Helper API untuk request ke backend dengan JWT
import { useAuth } from '@/contexts/AuthContext';

// Environment configuration - simplified
const getBaseUrl = () => {
  // Use environment variable if available, otherwise detect based on hostname
  let apiUrl = import.meta.env.VITE_API_URL;
  
  // Debug logging
  console.log('🔍 API Base URL Detection:', {
    envVar: apiUrl,
    hostname: window.location.hostname,
    protocol: window.location.protocol,
    href: window.location.href,
    mode: import.meta.env.MODE
  });
  
  // If API URL is set, match the protocol with current page to avoid mixed content
  if (apiUrl) {
    const currentProtocol = window.location.protocol;
    const apiProtocol = apiUrl.startsWith('https://') ? 'https:' : 'http:';
    
    // If protocols don't match and we're on HTTP, try to use HTTP version
    if (currentProtocol === 'http:' && apiProtocol === 'https:') {
      // Try to convert HTTPS URL to HTTP if accessing via HTTP
      apiUrl = apiUrl.replace('https://', 'http://');
      console.warn('⚠️ Protocol mismatch detected, using HTTP version:', apiUrl);
    } else {
      console.log('✅ Using VITE_API_URL:', apiUrl);
    }
    return apiUrl;
  }
  
  // Fallback: detect based on hostname
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    console.log('✅ Using localhost fallback');
    return 'http://localhost:3001';
  }

  // Production fallback: use same protocol as current page
  const protocol = window.location.protocol;
  const hostname = window.location.hostname;
  
  // If accessing via IP, try to use bemutasi.rivaldev.site with matching protocol
  if (hostname === '103.41.207.103' || hostname.includes('103.41.207.103')) {
    const defaultUrl = `${protocol}//bemutasi.rivaldev.site`;
    console.warn('⚠️ VITE_API_URL not found, using production fallback with matching protocol:', defaultUrl);
    return defaultUrl;
  }
  
  // Default fallback
  const defaultProductionUrl = `${protocol}//bemutasi.rivaldev.site`;
  console.warn('⚠️ VITE_API_URL not found, using production fallback:', defaultProductionUrl);
  return defaultProductionUrl;
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
      // Jika refresh gagal, coba lagi sekali dengan delay
      console.log('⚠️ Token refresh failed, retrying once...');
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
        console.log('❌ Retry refresh also failed:', retryError);
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

// API function untuk replace file
export const replaceFile = async (pengajuanId: string, fileId: string, file: File, token: string, userRole: string, fileCategory?: string) => {
  const formData = new FormData();
  formData.append('file', file);
  
  // Logic untuk menentukan endpoint berdasarkan user role dan file category
  let baseUrl = '/api';
  
  if (userRole === 'admin_wilayah') {
    // Admin wilayah selalu menggunakan endpoint admin-wilayah
    baseUrl = '/api/admin-wilayah';
  } else if (userRole === 'admin') {
    // Super admin: gunakan endpoint admin-wilayah untuk file admin_wilayah, endpoint biasa untuk file kabupaten
    if (fileCategory === 'admin_wilayah') {
      baseUrl = '/api/admin-wilayah';
    } else {
      baseUrl = '/api';
    }
  }
  
  const url = `${baseUrl}/pengajuan/${pengajuanId}/files/${fileId}/replace`;
  const fullUrl = getBaseUrl() + url;
  
  console.log('🔍 Debug API replace file:', {
    pengajuanId,
    fileId,
    fileName: file.name,
    userRole,
    fileCategory,
    baseUrl,
    url,
    fullUrl,
    token: token ? 'exists' : 'missing'
  });
  
  const response = await fetch(fullUrl, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
    body: formData,
  });
  
  console.log('🔍 Response status:', response.status);
  console.log('🔍 Response ok:', response.ok);
  
  const result = await response.json();
  console.log('🔍 Response data:', result);
  
  if (!response.ok) {
    throw new Error(result.message || 'Gagal mengganti file');
  }
  
  return result;
}; 