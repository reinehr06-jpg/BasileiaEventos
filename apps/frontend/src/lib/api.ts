const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const getHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${localStorage.getItem("token")}`,
});

export async function apiFetch(path: string, options: RequestInit = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export const authApi = {
  register: (data: { accountName: string; accountSlug: string; email: string; password: string; name: string }) =>
    apiFetch("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),
  login: (email: string, password: string) =>
    apiFetch("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),
};

export const eventApi = {
  list: () => apiFetch("/api/events", { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
  get: (id: string) => apiFetch(`/api/events/${id}`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
  create: (data: any) => apiFetch("/api/events", { method: "POST", body: JSON.stringify(data), headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
  update: (id: string, data: any) => apiFetch(`/api/events/${id}`, { method: "PUT", body: JSON.stringify(data), headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
};

export const ticketApi = {
  listTypes: (eventId: string) => apiFetch(`/api/tickets/events/${eventId}/types`, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
  createType: (data: any) => apiFetch("/api/tickets/types", { method: "POST", body: JSON.stringify(data), headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }),
  listLots: async (typeId: string) => (await fetch(`${API_URL}/api/tickets/lots?typeId=${typeId}`, { headers: getHeaders() })).json(),
  createLot: async (data: any) => (await fetch(`${API_URL}/api/tickets/lots`, { method: "POST", headers: getHeaders(), body: JSON.stringify(data) })).json(),
  validate: async (token: string, fingerprint?: string, geo?: any) => 
    (await fetch(`${API_URL}/api/tickets/validate`, { 
      method: "POST", 
      headers: getHeaders(), 
      body: JSON.stringify({ token, deviceFingerprint: fingerprint, geolocation: geo }) 
    })).json(),
};

export const checkinApi = {
  getSync: async (eventId: string) => (await fetch(`${API_URL}/api/checkin/sync/${eventId}`, { headers: getHeaders() })).json(),
  uploadSync: async (logs: any[]) => (await fetch(`${API_URL}/api/checkin/sync`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ logs }) })).json(),
  getStats: async (eventId: string) => (await fetch(`${API_URL}/api/checkin/stats/${eventId}`, { headers: getHeaders() })).json(),
};
