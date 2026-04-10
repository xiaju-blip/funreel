const API_BASE = import.meta.env.VITE_API_BASE || '/api';

export async function apiGet<T = any>(url: string): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    credentials: 'include',
  });
  return response.json();
}

export async function apiPost<T = any>(url: string, data: any): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function apiPut<T = any>(url: string, data: any): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(data),
  });
  return response.json();
}

export async function apiDelete<T = any>(url: string): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  return response.json();
}

export default {
  get: apiGet,
  post: apiPost,
  put: apiPut,
  delete: apiDelete,
};
