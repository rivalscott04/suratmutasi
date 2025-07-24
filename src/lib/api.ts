// Helper API untuk request ke backend dengan JWT
export async function apiFetch(method: string, url: string, options: { data?: any; token?: string; headers?: any } = {}) {
  const { data, token, headers = {} } = options;
  const BASE_URL = 'https://bemutasi.rivaldev.site';
  // Jika url tidak diawali http/https, tambahkan BASE_URL
  const fullUrl = url.startsWith('http') ? url : BASE_URL + url;
  const fetchOptions: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  };
  if (data) {
    fetchOptions.body = JSON.stringify(data);
  }
  const res = await fetch(fullUrl, fetchOptions);
  const contentType = res.headers.get('content-type');
  let responseData;
  if (contentType && contentType.includes('application/json')) {
    responseData = await res.json();
  } else {
    responseData = await res.text();
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