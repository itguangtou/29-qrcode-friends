import { getCurrentQrUrl } from './lib/qr-blob'

export async function GET() {
  const url = await getCurrentQrUrl()
  if (url) {
    return Response.json({ url })
  }

  return Response.json({ url: '/qrcode.jpg' })
}
