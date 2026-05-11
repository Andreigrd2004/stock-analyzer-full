// Define API base url. Assuming it runs on typical Spring Boot port 8080 or passed via env in Next.js
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Fetch wrapper for consistent options and error handling
export async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  // Isomorphic way to get token on client side
  let token = null;
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/(^|;)\s*accessToken\s*=\s*([^;]+)/);
    if (match) token = match[2];
  }

  const headers: HeadersInit = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle HTML response indicating authentication redirect
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('text/html')) {
    throw new Error('Authentication Required. Endpoint is protected.');
  }

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error('Unauthorized access. Please log in or check your permissions.');
    }
    const errText = await response.text();

    // Log the true actual error for debugging purposes in the console
    console.error(`Backend Error [${response.status}]:`, errText);

    // Map status codes to soft messages
    let friendlyMessage = 'An unexpected error occurred while communicating with the server.';
    
    // Attempt to parse backend error message
    let backendMessage = '';
    try {
      const errObj = JSON.parse(errText);
      backendMessage = errObj.message || '';
    } catch(e) {}

    if (backendMessage === 'Stock interest already exists.') {
      friendlyMessage = backendMessage;
    } else if (response.status === 400) {
      friendlyMessage = 'Invalid request data. Please check your inputs.';
    } else if (response.status === 404) {
      friendlyMessage = 'The requested data could not be found.';
    } else if (response.status === 429) {
      friendlyMessage = 'Too many requests. Please slow down and try again later.';
    } else if (response.status === 500 || response.status === 503) {
      friendlyMessage = 'Our engine is currently experiencing a temporary issue. Please try again later.';
    }

    throw new Error(friendlyMessage);
  }

  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (e) {
    // If the response is not valid JSON, return the raw text
    return text as unknown as T;
  }
}
