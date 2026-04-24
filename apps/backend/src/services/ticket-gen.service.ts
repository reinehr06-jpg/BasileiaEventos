import QRCode from "qrcode";
import puppeteer from "puppeteer";
import fs from "fs";
import path from "path";

export class TicketGenService {
  async generateQRCode(token: string): Promise<string> {
    return QRCode.toDataURL(token);
  }

  async generatePDF(data: { 
    buyerName: string, 
    eventTitle: string, 
    date: string, 
    ticketCode: string, 
    qrCodeDataUrl: string 
  }): Promise<Buffer> {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    const html = `
      <html>
        <body style="font-family: Arial, sans-serif; padding: 40px; text-align: center;">
          <h1 style="color: #2563eb;">${data.eventTitle}</h1>
          <p><strong>Comprador:</strong> ${data.buyerName}</p>
          <p><strong>Data:</strong> ${data.date}</p>
          <div style="margin: 40px 0;">
            <img src="${data.qrCodeDataUrl}" width="200" />
          </div>
          <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px;">${data.ticketCode}</p>
          <p style="color: #666;">Apresente este QR Code na portaria.</p>
        </body>
      </html>
    `;

    await page.setContent(html);
    const pdf = await page.pdf({ format: 'A4' });
    await browser.close();
    return Buffer.from(pdf);
  }
}
