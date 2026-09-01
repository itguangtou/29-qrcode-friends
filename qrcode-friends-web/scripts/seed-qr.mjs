/**
 * 将 doc/image 下的二维码上传到 Vercel Blob（首次部署后运行一次）
 *
 * 用法：
 *   cd qrcode-friends-web
 *   $env:BLOB_READ_WRITE_TOKEN="你的token"
 *   pnpm seed
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { del, list, put } from '@vercel/blob'

const QR_PREFIX = 'qrcode/'
const QR_PATH = 'qrcode/current.jpg'
const QR_CACHE_MAX_AGE = 60

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const imagePath = join(root, 'doc/image/3f8133d6-c00e-4ade-a85a-4a86f8a578c4.jpg')

async function cleanupOtherQrBlobs(keepPathname) {
  let cursor
  do {
    const result = await list({ prefix: QR_PREFIX, cursor })
    const orphans = result.blobs.filter((blob) => blob.pathname !== keepPathname)
    if (orphans.length > 0) {
      await del(orphans.map((blob) => blob.url))
    }
    cursor = result.hasMore ? result.cursor : undefined
  } while (cursor)
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('请设置环境变量 BLOB_READ_WRITE_TOKEN')
    process.exit(1)
  }

  const buffer = readFileSync(imagePath)
  const blob = await put(QR_PATH, buffer, {
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

  console.log('上传成功:', blob.url)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
