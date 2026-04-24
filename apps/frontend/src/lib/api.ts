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
  list: () => apiFetch("/api/events", { headers: getHeaders() }),
  get: (id: string) => apiFetch(`/api/events/${id}`, { headers: getHeaders() }),
  create: (data: any) => apiFetch("/api/events", { method: "POST", body: JSON.stringify(data), headers: getHeaders() }),
  update: (id: string, data: any) => apiFetch(`/api/events/${id}`, { method: "PUT", body: JSON.stringify(data), headers: getHeaders() }),
  listZones: (id: string) => apiFetch(`/api/events/${id}/zones`, { headers: getHeaders() }),
  createZone: (id: string, data: any) => apiFetch(`/api/events/${id}/zones`, { method: "POST", body: JSON.stringify(data), headers: getHeaders() }),
};

export const ticketApi = {
  listTypes: (eventId: string) => apiFetch(`/api/tickets/events/${eventId}/types`, { headers: getHeaders() }),
  createType: (data: any) => apiFetch("/api/tickets/types", { method: "POST", body: JSON.stringify(data), headers: getHeaders() }),
  listLots: async (typeId: string) => (await fetch(`${API_URL}/api/tickets/types/${typeId}/lots`, { headers: getHeaders() })).json(),
  createLot: async (data: any) => (await fetch(`${API_URL}/api/tickets/lots`, { method: "POST", headers: getHeaders(), body: JSON.stringify(data) })).json(),
  validate: async (token: string, fingerprint?: string, geo?: any) => 
    (await fetch(`${API_URL}/api/tickets/validate`, { 
      method: "POST", 
      headers: getHeaders(), 
      body: JSON.stringify({ token, deviceFingerprint: fingerprint, geolocation: geo }) 
    })).json(),
  toggleZone: (typeId: string, zoneId: string) => apiFetch(`/api/tickets/types/${typeId}/zones/${zoneId}`, { method: "POST", headers: getHeaders() }),
  getByToken: (token: string) => apiFetch(`/api/tickets/by-token/${token}`, { headers: getHeaders() }),
};

export const checkinApi = {
  getSync: async (eventId: string) => (await fetch(`${API_URL}/api/checkin/sync/${eventId}`, { headers: getHeaders() })).json(),
  uploadSync: async (logs: any[]) => (await fetch(`${API_URL}/api/checkin/sync`, { method: "POST", headers: getHeaders(), body: JSON.stringify({ logs }) })).json(),
  getStats: async (eventId: string) => (await fetch(`${API_URL}/api/checkin/stats/${eventId}`, { headers: getHeaders() })).json(),
};

export const facialApi = {
  capture: (data: { ticketId: string; imageBase64: string; eventId: string }) => apiFetch("/api/facial/capture", { method: "POST", body: JSON.stringify(data), headers: getHeaders() }),
  identify: (data: { eventId: string; imageBase64: string }) => apiFetch("/api/facial/identify", { method: "POST", body: JSON.stringify(data), headers: getHeaders() }),
  getStatus: (ticketId: string) => apiFetch(`/api/facial/status/${ticketId}`, { headers: getHeaders() }),
};

export const trackingApi = {
  createLink: (data: any) => apiFetch("/api/tracking/links", { method: "POST", body: JSON.stringify(data), headers: getHeaders() }),
  listLinks: (eventId: string) => apiFetch(`/api/tracking/links/${eventId}`, { headers: getHeaders() }),
  getFunnel: (eventId: string) => apiFetch(`/api/tracking/funnel/${eventId}`, { headers: getHeaders() }),
};

export const seatApi = {
  listByEvent: (eventId: string) => apiFetch(`/api/seats/events/${eventId}`, { headers: getHeaders() }),
  reserve: (data: { seatId: string; userId?: string }) => apiFetch("/api/seats/reserve", { method: "POST", body: JSON.stringify(data), headers: getHeaders() }),
};

export const waitlistApi = {
  join: (data: any) => apiFetch("/api/waitlist/join", { method: "POST", body: JSON.stringify(data), headers: getHeaders() }),
  getStats: (eventId: string) => apiFetch(`/api/waitlist/stats/${eventId}`, { headers: getHeaders() }),
};

export const physicalApi = {
  listProducts: (eventId: string) => apiFetch(`/api/physical/products/${eventId}`, { headers: getHeaders() }),
  createProduct: (data: any) => apiFetch("/api/physical/products", { method: "POST", body: JSON.stringify(data), headers: getHeaders() }),
  linkToType: (typeId: string, productId: string) => apiFetch(`/api/physical/types/${typeId}/link/${productId}`, { method: "POST", headers: getHeaders() }),
  listShipping: (eventId: string) => apiFetch(`/api/physical/shipping/${eventId}`, { headers: getHeaders() }),
  retryFulfillment: (shippingId: number) => apiFetch(`/api/physical/shipping/${shippingId}/retry`, { method: "POST", headers: getHeaders() }),
};

export const planningApi = {
  suggest: (data: { prompt: string; location?: string }) => apiFetch("/api/planning/suggest", { method: "POST", body: JSON.stringify(data), headers: getHeaders() }),
  confirmSupplier: (data: any) => apiFetch("/api/planning/suppliers", { method: "POST", body: JSON.stringify(data), headers: getHeaders() }),
  listSuppliers: (eventId: string) => apiFetch(`/api/planning/suppliers/${eventId}`, { headers: getHeaders() }),
  getFinanceSummary: (eventId: string) => apiFetch(`/api/planning/finance/${eventId}`, { headers: getHeaders() }),
  exportToFinance: (eventId: string) => apiFetch(`/api/planning/finance/${eventId}/export`, { method: "POST", headers: getHeaders() }),
};
