import { head } from '@vercel/blob'

const QR_PATH = 'qrcode/current.png'

export async function GET() {
  try {
    const blob = await head(QR_PATH)
    return Response.json({ url: `${blob.url}?v=${Date.now()}` })
  } catch {
    return Response.json({ url: '/qrcode.jpg' })
  }
}
