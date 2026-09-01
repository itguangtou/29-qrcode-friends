import { del, head, list, put, type PutBody } from '@vercel/blob'

export const QR_PREFIX = 'qrcode/'
export const QR_PATH = 'qrcode/current.jpg'
/** Blob CDN 最短缓存 60 秒；展示时用 ?v= 时间戳避免旧图 */
export const QR_CACHE_MAX_AGE = 60

export function withCacheBuster(url: string) {
  const base = url.split('?')[0] ?? url
  return `${base}?v=${Date.now()}`
}

/** 删除 qrcode/ 下除当前文件外的旧图 */
async function cleanupOtherQrBlobs(keepPathname: string) {
  let cursor: string | undefined
  do {
    const result = await list({ prefix: QR_PREFIX, cursor })
    const orphans = result.blobs.filter((blob) => blob.pathname !== keepPathname)
    if (orphans.length > 0) {
      await del(orphans.map((blob) => blob.url))
    }
    cursor = result.hasMore ? result.cursor : undefined
  } while (cursor)
}

/** 先覆盖上传固定路径，再清理多余旧图，避免先删后传导致偶发失败 */
export async function uploadQrBlob(body: PutBody) {
  const blob = await put(QR_PATH, body, {
    access: 'public',
    allowOverwrite: true,
    contentType: 'image/jpeg',
    cacheControlMaxAge: QR_CACHE_MAX_AGE,
  })

  try {
    await cleanupOtherQrBlobs(QR_PATH)
  } catch (err) {
    console.warn('QR orphan cleanup failed:', err)
  }

  return blob
}

export async function getCurrentQrUrl() {
  try {
    const blob = await head(QR_PATH)
    return withCacheBuster(blob.url)
  } catch {
    return null
  }
}
