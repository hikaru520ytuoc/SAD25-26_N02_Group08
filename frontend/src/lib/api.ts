export type HealthResponse = {
  success: boolean;
  data: {
    status: string;
    service: string;
    database: 'ok' | 'error';
    timestamp: string;
  };
  message: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8080';

export async function getBackendHealth(): Promise<HealthResponse> {
  const response = await fetch(`${API_BASE_URL}/api/health`, {
    method: 'GET',
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error(`Backend health check failed with status ${response.status}`);
  }

  return response.json() as Promise<HealthResponse>;
}
