// NOTE: This file is intended for use inside Firebase Cloud Functions (Node 20).
// Puppeteer is NOT installed in the Next.js package.json.
// Import it only from the functions package.

import type { ClientSession } from '@/types'
import { buildReportHTML } from './template'

export async function generatePDF(session: ClientSession): Promise<Buffer> {
  // Dynamic import to avoid bundling in Next.js
  const puppeteer = await import('puppeteer')
  const browser = await puppeteer.default.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  })

  try {
    const page = await browser.newPage()
    const html = buildReportHTML(session)
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 60000 })
    // Give a short extra moment for layout to settle
    await new Promise((r) => setTimeout(r, 500))
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: { top: '0', right: '0', bottom: '0', left: '0' },
    })
    return Buffer.from(pdfBuffer)
  } finally {
    await browser.close()
  }
}
