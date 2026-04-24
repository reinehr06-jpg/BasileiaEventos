import { FastifyInstance } from "fastify";

export default async function staticRoutes(server: FastifyInstance) {
  
  // Widget Script
  server.get("/widget.js", async (request, reply) => {
    const script = `
(function() {
  const scripts = document.getElementsByTagName('script');
  const currentScript = scripts[scripts.length - 1];
  const eventId = currentScript.getAttribute('data-event');
  const tenantId = currentScript.getAttribute('data-tenant');
  const theme = currentScript.getAttribute('data-theme') || 'light';
  
  const API_URL = 'http://localhost:3001/api/public';
  
  async function init() {
    const res = await fetch(\`\${API_URL}/widget/\${tenantId}/events/\${eventId}\`);
    const data = await res.json();
    render(data);
  }

  function render(data) {
    const container = document.createElement('div');
    container.className = 'basileia-widget ' + theme;
    
    let html = \`
      <div style="font-family: sans-serif; border: 1px solid #ddd; border-radius: 12px; padding: 20px; max-width: 400px; background: \${theme === 'dark' ? '#111' : '#fff'}; color: \${theme === 'dark' ? '#fff' : '#000'}">
        <h3 style="margin: 0 0 10px 0">\${data.event.title}</h3>
        <div style="display: flex; flex-direction: column; gap: 10px">
    \`;
    
    data.ticketTypes.forEach(type => {
      html += \`
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 10px">
          <div>
            <div style="font-weight: bold">\${type.name}</div>
            <div style="font-size: 14px; opacity: 0.7">R$ \${type.price}</div>
          </div>
          <button onclick="window.location.href='http://localhost:3000/checkout/\${type.id}?tenant=\${tenantId}'" style="background: #2563eb; color: #fff; border: none; padding: 8px 16px; border-radius: 6px; font-weight: bold; cursor: pointer">Comprar</button>
        </div>
      \`;
    });
    
    html += '</div></div>';
    container.innerHTML = html;
    currentScript.parentNode.insertBefore(container, currentScript);
  }

  init();
})();
    `;
    reply.type("application/javascript").send(script);
  });

  // Pixel Script
  server.get("/pixel.js", async (request, reply) => {
    const script = `
(function() {
  const urlParams = new URLSearchParams(window.location.search);
  const trackingId = urlParams.get('utm_id') || urlParams.get('basileia_tid');
  const tenantId = document.currentScript.getAttribute('data-tenant');
  
  if (!trackingId) return;

  const API_URL = 'http://localhost:3001/api/public/track';

  async function track(type, metadata = {}) {
    await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingId, eventType: type, metadata, tenantId })
    });
  }

  // Auto track pageview
  track('view');

  // Expose to window
  window.BasileiaPixel = { track };
})();
    `;
    reply.type("application/javascript").send(script);
  });
}
