import { list } from '@vercel/blob'

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET() {
  try {
    const { blobs } = await list({ prefix: 'qrcode/' })
    if (blobs && blobs.length > 0) {
      // 按照上传时间倒序，获取最新的一张
      const latest = blobs.sort(
        (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime(),
      )[0]
      if (latest?.url) {
        return Response.json({ url: latest.url }, { headers: NO_CACHE_HEADERS })
      }
    }
  } catch (err) {
    console.error('Failed to list qr blobs:', err)
  }

  return Response.json({ url: null }, { headers: NO_CACHE_HEADERS })
}
