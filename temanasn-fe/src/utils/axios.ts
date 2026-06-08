import axios, { AxiosResponse, AxiosError } from 'axios';
import { SERVER_URL_API } from '@/const';
import { useAuthStore } from '@/stores/auth-store';
import moment from 'moment';
// Global flag to prevent multiple alerts for JWT version invalid
let alertShown = false;
/**
 * Centralized error handler for API responses.
 * Handles token-related errors by logging out the user.
 * Shows a one-time alert for JWT version invalid.
 * Returns a standardized error object, using backend msg for non-token errors.
 */
const handleError = (error: AxiosError): { error: true; status: number; message: string } => {
  const backendMsg = error?.response?.data?.msg || error?.response?.data?.message;
  const status = error?.response?.status ?? 500;
  const msg = backendMsg || error.message;
  
  // Handle token expiration or invalidation → auto-logout
  if (
    msg === 'jwt expired' ||
    msg === 'jwt malformed' ||
    msg === 'invalid token' ||
    msg === 'invalid signature' ||
    msg === 'Authentication invalid' ||
    msg === 'Authentication: User not found' ||
    msg === 'invalid algorithm'
  ) {
    localStorage.removeItem('authentication');
    const redirectTo = window.location.pathname + window.location.search;
    window.location.href = `/auth/login?${redirectTo}`;
    return { error: true, status: 401, message: 'Session expired. Redirecting to login...' };
  }
  // Handle JWT version invalid (one-time alert)
  if (msg === 'JWT Version not valid' && !alertShown) {
    alertShown = true;
    alert('Akun Anda telah login di perangkat lain. Silahkan login kembali.');
    localStorage.removeItem('authentication');
    const redirectTo = window.location.pathname + window.location.search;
    window.location.href = `/auth/login?${redirectTo}`;
    return { error: true, status: 401, message: 'Session invalid. Redirecting to login...' };
  }
  // Untuk error lain (misal 400 Bad Request seperti "Password salah"), gunakan pesan dari backend
  // Fallback ke generic jika backend tidak kasih pesan spesifik
  const safeMessage = 'Cek ulang data anda, jika masih error, hubungi Admin';
  return {
    error: true,
    status,
    message: backendMsg || safeMessage,
  };
};
/**
 * Generic GET request with optional params.
 * Returns data.data on success, error object on failure.
 */
export async function getData<T = any>(url: string, params?: any): Promise<T | { error: true; status: number; message: string }> {
  try {
    const token = useAuthStore.getState().token || '';
    const response: AxiosResponse<{ data: T }> = await axios.get(`${SERVER_URL_API}/${url}`, {
      params,
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.data;
  } catch (error) {
    return handleError(error as AxiosError);
  }
}
/**
 * Download Excel file from API.
 * Creates a blob URL and triggers download with formatted filename.
 */
export async function getExcel(url: string, fileName: string, params?: any): Promise<void> {
  try {
    const token = useAuthStore.getState().token || '';
    const response = await axios.request({
      responseType: 'arraybuffer',
      url: `${SERVER_URL_API}/${url}`,
      method: 'GET',
      params,
      headers: {
        'Content-Type': 'blob',
        Authorization: `Bearer ${token}`,
      },
    });
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.setAttribute('download', `${fileName}-${moment().format('DD-MM-YYYY')}.xlsx`);
    link.target = '_self';
    link.rel = 'noopener noreferrer';
    link.style.display = 'none';
    document.body.appendChild(link);
    // Delay click sedikit untuk hindari Chrome MacOS infinite tab bug
    setTimeout(() => {
      link.click();
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(downloadUrl);
      }, 150);
    }, 100);
  } catch (error) {
    handleError(error as AxiosError);
  }
}
/**
 * Generic POST request.
 * Returns AxiosResponse on success, error object on failure.
 */
export async function postData(url: string, payload?: any): Promise<AxiosResponse | { error: true; status: number; message: string }> {
  try {
    const token = useAuthStore.getState().token || '';
    const response: AxiosResponse = await axios.post(`${SERVER_URL_API}/${url}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    return handleError(error as AxiosError);
  }
}
/**
 * Generic PATCH request.
 * Replaces null/undefined values with empty strings.
 * Returns AxiosResponse on success, error object on failure.
 */
export async function patchData(url: string, payload: any): Promise<AxiosResponse | { error: true; status: number; message: string }> {
  try {
    // Replace null/undefined with empty strings to avoid backend issues
    Object.keys(payload).forEach((key) => {
      if (payload[key] === null || payload[key] === undefined) {
        payload[key] = '';
      }
    });
    const token = useAuthStore.getState().token || '';
    const response: AxiosResponse = await axios.patch(`${SERVER_URL_API}/${url}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    return handleError(error as AxiosError);
  }
}
/**
 * Generic PUT request.
 * Replaces null/undefined values with empty strings.
 * Returns AxiosResponse on success, error object on failure.
 */
export async function putData(url: string, payload: any): Promise<AxiosResponse | { error: true; status: number; message: string }> {
  try {
    // Replace null/undefined with empty strings to avoid backend issues
    Object.keys(payload).forEach((key) => {
      if (payload[key] === null || payload[key] === undefined) {
        payload[key] = '';
      }
    });
    const token = useAuthStore.getState().token || '';
    const response: AxiosResponse = await axios.put(`${SERVER_URL_API}/${url}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    return handleError(error as AxiosError);
  }
}
/**
 * Generic DELETE request.
 * Returns AxiosResponse on success, error object on failure.
 */
export async function deleteData(url: string): Promise<AxiosResponse | { error: true; status: number; message: string }> {
  try {
    const token = useAuthStore.getState().token || '';
    const response: AxiosResponse = await axios.delete(`${SERVER_URL_API}/${url}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response;
  } catch (error) {
    return handleError(error as AxiosError);
  }
}