import axios from "axios";

export class FulfillmentService {
  constructor(private tenantDb: any) {}

  async processOrder(orderId: string) {
    // 1. Check if order has physical products
    const res = await this.tenantDb.query(
      `SELECT os.*, pp.sku, pp.fulfillment_provider, pp.fulfillment_config, o.buyer_name, o.buyer_email
       FROM order_shipping os
       JOIN physical_products pp ON os.physical_product_id = pp.id
       JOIN orders o ON os.order_id = o.id
       WHERE os.order_id = $1`,
      [orderId]
    );

    for (const shipping of res.rows) {
      try {
        if (shipping.fulfillment_provider === 'amazon') {
          await this.sendToAmazon(shipping);
        } else if (shipping.fulfillment_provider === 'webhook') {
          await this.sendToWebhook(shipping);
        }
        
        await this.tenantDb.query(
          "UPDATE order_shipping SET status = 'shipped', updated_at = NOW() WHERE id = $1",
          [shipping.id]
        );
      } catch (err: any) {
        await this.tenantDb.query(
          "UPDATE order_shipping SET status = 'error', error_message = $1, updated_at = NOW() WHERE id = $2",
          [err.message, shipping.id]
        );
      }
    }
  }

  private async sendToAmazon(data: any) {
    console.log(`[Amazon Fulfillment] Dispatching SKU ${data.sku} to ${data.buyer_name}`);
    // Mock call to Amazon SP-API
    return { amazon_order_id: `AMZ-${Math.random().toString(36).substr(2, 9)}` };
  }

  private async sendToWebhook(data: any) {
    const url = data.fulfillment_config?.url;
    if (!url) throw new Error("Webhook URL not configured");

    console.log(`[Webhook Fulfillment] Sending to ${url}`);
    await axios.post(url, {
      order_id: data.order_id,
      sku: data.sku,
      buyer: { name: data.buyer_name, email: data.buyer_email },
      address: {
        line1: data.address_line1,
        line2: data.address_line2,
        city: data.city,
        state: data.state,
        zip: data.zip_code
      }
    });
  }
}
