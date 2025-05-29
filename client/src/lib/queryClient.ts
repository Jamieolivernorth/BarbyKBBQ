import { QueryClient, QueryFunction } from "@tanstack/react-query";
import { config, CURRENT_ENV } from "@shared/config";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Construct full URL if it's a relative path and not already an absolute URL
  const fullUrl = url.startsWith('http') ? url : `${config.apiUrl}${url}`;
  
  console.log(`Making ${method} request to: ${fullUrl}`);
  console.log(`Config API URL: ${config.apiUrl}`);
  console.log(`Environment: ${CURRENT_ENV}`);
  
  // Add environment headers for debugging
  const headers: Record<string, string> = {
    ...data ? { "Content-Type": "application/json" } : {},
    "X-Environment": CURRENT_ENV
  };
  
  try {
    const res = await fetch(fullUrl, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    await throwIfResNotOk(res);
    return res;
  } catch (error) {
    console.error(`Fetch error for ${fullUrl}:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    // Construct full URL if it's a relative path and not already an absolute URL
    const url = queryKey[0] as string;
    const fullUrl = url.startsWith('http') ? url : `${config.apiUrl}${url}`;
    
    const res = await fetch(fullUrl, {
      credentials: "include",
      headers: {
        "X-Environment": CURRENT_ENV
      }
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return await res.json();
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
