import { head } from '@vercel/blob'

const QR_PATHS = ['qrcode/current.jpg', 'qrcode/current.png']

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET() {
  for (const path of QR_PATHS) {
    try {
      const blob = await head(path)
      return Response.json(
        { url: `${blob.url}?v=${Date.now()}` },
        { headers: NO_CACHE_HEADERS },
      )
    } catch {
      // try next path
    }
  }

  return Response.json({ url: null }, { headers: NO_CACHE_HEADERS })
}
