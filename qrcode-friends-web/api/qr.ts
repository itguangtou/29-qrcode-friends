import { head } from '@vercel/blob'

const QR_PATHS = ['qrcode/current.jpg', 'qrcode/current.png']

export async function GET() {
  for (const path of QR_PATHS) {
    try {
      const blob = await head(path)
      return Response.json({ url: `${blob.url}?v=${Date.now()}` })
    } catch {
      // try next path
    }
  }

  return Response.json({ url: '/qrcode.jpg' })
}
