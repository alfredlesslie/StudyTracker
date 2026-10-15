/**
 * StudySense AI - Centralized Backend API Client
 * 
 * Provides unified HTTP methods, error handling, timeout management,
 * and connection status checking for the FastAPI backend.
 * 
 * Uses VITE_API_BASE_URL environment variable with fallback to http://127.0.0.1:8000.
 * Never exposes credentials or secrets in logs.
 */

export const API_BASE_URL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) || "http://127.0.0.1:8000";

const DEFAULT_TIMEOUT_MS = 45000;

// Cached backend health status to prevent request hammering
let _isBackendAvailable = null;
let _lastHealthCheckTime = 0;
const HEALTH_CACHE_TTL_MS = 10000; // 10 seconds

/**
 * Check if backend is reachable
 * @param {boolean} forceRefresh
 * @returns {Promise<boolean>}
 */
export async function checkBackendReachable(forceRefresh = false) {
  const now = Date.now();
  if (
    !forceRefresh &&
    _isBackendAvailable !== null &&
    now - _lastHealthCheckTime < HEALTH_CACHE_TTL_MS
  ) {
    return _isBackendAvailable;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2000);
    const res = await fetch(`${API_BASE_URL}/health`, {
      method: "GET",
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    _isBackendAvailable = res.ok;
    _lastHealthCheckTime = now;
    return res.ok;
  } catch (err) {
    _isBackendAvailable = false;
    _lastHealthCheckTime = now;
    return false;
  }
}

/**
 * Core HTTP fetch wrapper with timeout, JSON parsing, and graceful error handling.
 * 
 * @param {string} endpoint - API path (e.g., "/api/subjects")
 * @param {Object} options - Standard fetch options
 * @returns {Promise<{ ok: boolean, data: any, error: string|null, status: number }>}
 */
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint.startsWith("/") ? endpoint : "/" + endpoint}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(
    () => controller.abort(),
    options.timeout || DEFAULT_TIMEOUT_MS
  );

  const headers = {
    "Accept": "application/json",
    ...(options.body ? { "Content-Type": "application/json" } : {}),
    ...(options.headers || {})
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    let data = null;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      data = await response.json();
    } else if (response.status !== 204) {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg =
        (data && typeof data === "object" && (data.detail || data.message)) ||
        `Request failed with status ${response.status}`;
      return {
        ok: false,
        data: null,
        error: String(errorMsg),
        status: response.status
      };
    }

    _isBackendAvailable = true;
    return {
      ok: true,
      data,
      error: null,
      status: response.status
    };
  } catch (err) {
    clearTimeout(timeoutId);
    _isBackendAvailable = false;
    const isAbort = err.name === "AbortError";
    const errorMsg = isAbort
      ? "Request timed out. Backend may be offline."
      : "Network error connecting to backend service.";

    return {
      ok: false,
      data: null,
      error: errorMsg,
      status: isAbort ? 408 : 0
    };
  }
}

/**
 * Perform a GET request
 * @param {string} endpoint
 * @param {Object} [queryParams]
 * @returns {Promise<{ ok: boolean, data: any, error: string|null, status: number }>}
 */
export async function apiGet(endpoint, queryParams = {}) {
  let url = endpoint;
  const entries = Object.entries(queryParams).filter(
    ([_, v]) => v !== undefined && v !== null && v !== ""
  );
  if (entries.length > 0) {
    const search = new URLSearchParams(entries).toString();
    url += (url.includes("?") ? "&" : "?") + search;
  }
  return apiRequest(url, { method: "GET" });
}

/**
 * Perform a POST request
 * @param {string} endpoint
 * @param {Object} body
 * @returns {Promise<{ ok: boolean, data: any, error: string|null, status: number }>}
 */
export async function apiPost(endpoint, body = {}) {
  return apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body)
  });
}

/**
 * Perform a PUT request
 * @param {string} endpoint
 * @param {Object} body
 * @returns {Promise<{ ok: boolean, data: any, error: string|null, status: number }>}
 */
export async function apiPut(endpoint, body = {}) {
  return apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(body)
  });
}

/**
 * Perform a DELETE request
 * @param {string} endpoint
 * @returns {Promise<{ ok: boolean, data: any, error: string|null, status: number }>}
 */
export async function apiDelete(endpoint) {
  return apiRequest(endpoint, { method: "DELETE" });
}
