import axios from "axios";

export async function triggerWebhook(url: string, event: string, payload: any) {
  if (!url) return;

  const maxRetries = 3;
  let attempts = 0;
  
  const body = {
    event,
    timestamp: new Date().toISOString(),
    data: payload
  };

  while (attempts < maxRetries) {
    try {
      await axios.post(url, body, { timeout: 5000 });
      console.log(`Webhook ${event} sent to ${url}`);
      return;
    } catch (error) {
      attempts++;
      console.error(`Webhook attempt ${attempts} failed for ${url}`);
      if (attempts < maxRetries) {
        await new Promise(res => setTimeout(res, 1000 * Math.pow(2, attempts))); // Exponential backoff
      }
    }
  }
}
