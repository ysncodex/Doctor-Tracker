import axios from 'axios';

interface ApiErrorBody {
  message?: string;
  errors?: string[];
}

/** Return a safe, useful message from the API without exposing raw server errors. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!axios.isAxiosError<ApiErrorBody>(error)) return fallback;

  const body = error.response?.data;

  if (Array.isArray(body?.errors) && body.errors.length > 0) {
    return body.errors.join('. ');
  }

  if (typeof body?.message === 'string' && body.message.trim()) {
    return body.message;
  }

  return fallback;
}
