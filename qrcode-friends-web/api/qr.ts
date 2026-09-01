import { head } from '@vercel/blob'

const QR_PATH = 'qrcode/current.jpg'

export async function GET() {
  try {
    const blob = await head(QR_PATH)
    return Response.json({ url: `${blob.url}?v=${Date.now()}` })
  } catch {
    // Blob 无图时回退到仓库内默认静态图
  }

  return Response.json({ url: '/qrcode.jpg' })
}
