import { useToast } from '../composables/useToast';

const API_URL = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? "/api" : "http://localhost:4000/api");
const TOKEN_KEY = "divina-comedia-token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(token) {
  refreshSubscribers.forEach(cb => cb(token));
  refreshSubscribers = [];
}

function addRefreshSubscriber(cb) {
  refreshSubscribers.push(cb);
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const token = getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const fetchOptions = {
    ...options,
    headers,
    credentials: "include" // Ensure cookies are sent
  };
  
  let response;
  try {
    response = await fetch(`${API_URL}${path}`, fetchOptions);
  } catch (networkErr) {
    const { showToast } = useToast();
    showToast("Falha de conexão. Verifique sua internet ou o servidor.", "error");
    throw networkErr;
  }

  if (response.status === 401 && path !== "/auth/refresh" && path !== "/auth/login") {
    if (!isRefreshing) {
      isRefreshing = true;
      try {
        const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
          method: "POST",
          credentials: "include"
        });

        const refreshData = await refreshRes.json();

        if (refreshRes.ok && refreshData.token) {
          setToken(refreshData.token);
          onRefreshed(refreshData.token);
        } else {
          clearToken();
          window.location.href = "/login";
        }
      } catch (err) {
        clearToken();
        window.location.href = "/login";
      } finally {
        isRefreshing = false;
      }
    }

    // Wait for the refresh to complete
    const retryPromise = new Promise(resolve => {
      addRefreshSubscriber(newToken => {
        headers.set("Authorization", `Bearer ${newToken}`);
        resolve(fetch(`${API_URL}${path}`, { ...fetchOptions, headers }));
      });
    });

    response = await retryPromise;
  }

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.message || "Erro na API.";
    const { showToast } = useToast();
    showToast(message, "error");
    throw new Error(message);
  }

  return payload;
}

export async function login(email, password) {
  return request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
    credentials: "include"
  });
}

export async function logoutUser() {
  try {
    await request("/auth/logout", { method: "POST", credentials: "include" });
  } finally {
    clearToken();
  }
}

export async function fetchPins(mapId, summary = false) {
  const query = new URLSearchParams();
  if (mapId) query.append("mapId", mapId);
  if (summary) query.append("summary", "true");
  
  const payload = await request(`/pins?${query.toString()}`);
  return payload.data;
}

export async function fetchPinById(id) {
  const payload = await request(`/pins/${id}`);
  return payload.data;
}

export async function createPin(formData) {
  const payload = await request("/pins", {
    method: "POST",
    body: formData
  });
  return payload.data;
}

export async function updatePin(id, formData) {
  const payload = await request(`/pins/${id}`, {
    method: "PUT",
    body: formData
  });
  return payload.data;
}

export async function deletePin(id) {
  return request(`/pins/${id}`, {
    method: "DELETE"
  });
}
