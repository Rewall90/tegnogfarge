type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

interface RequestOptions {
  method?: HTTPMethod;
  headers?: Record<string, string>;
  body?: unknown;
}

interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
}

const BASE_URL = '/api';

async function fetchApi<T>(
  endpoint: string, 
  options: RequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', headers = {}, body } = options;
  
  const requestHeaders: HeadersInit = {
    'Content-Type': 'application/json',
    ...headers,
  };
  
  const requestOptions: RequestInit = {
    method,
    headers: requestHeaders,
  };
  
  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, requestOptions);
    const responseData = response.headers.get('Content-Type')?.includes('application/json')
      ? await response.json()
      : null;
    
    if (!response.ok) {
      return {
        data: null,
        error: responseData?.message || response.statusText,
        status: response.status,
      };
    }
    
    return {
      data: responseData,
      error: null,
      status: response.status,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      status: 500,
    };
  }
}

export const apiClient = {
  get: <T>(endpoint: string, headers?: Record<string, string>) => 
    fetchApi<T>(endpoint, { method: 'GET', headers }),
  
  post: <T>(endpoint: string, data: unknown, headers?: Record<string, string>) => 
    fetchApi<T>(endpoint, { method: 'POST', body: data, headers }),
  
  put: <T>(endpoint: string, data: unknown, headers?: Record<string, string>) => 
    fetchApi<T>(endpoint, { method: 'PUT', body: data, headers }),
  
  patch: <T>(endpoint: string, data: unknown, headers?: Record<string, string>) => 
    fetchApi<T>(endpoint, { method: 'PATCH', body: data, headers }),
  
  delete: <T>(endpoint: string, headers?: Record<string, string>) => 
    fetchApi<T>(endpoint, { method: 'DELETE', headers }),
};

export default apiClient; 