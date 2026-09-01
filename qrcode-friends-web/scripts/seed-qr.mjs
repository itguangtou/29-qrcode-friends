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

const root = join(dirname(fileURLToPath(import.meta.url)), '../..')
const imagePath = join(root, 'doc/image/3f8133d6-c00e-4ade-a85a-4a86f8a578c4.jpg')

async function clearQrBlobs() {
  let cursor
  do {
    const result = await list({ prefix: QR_PREFIX, cursor })
    if (result.blobs.length > 0) {
      await del(result.blobs.map((b) => b.url))
    }
    cursor = result.hasMore ? result.cursor : undefined
  } while (cursor)
}

async function main() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    console.error('请设置环境变量 BLOB_READ_WRITE_TOKEN')
    process.exit(1)
  }

  await clearQrBlobs()

  const buffer = readFileSync(imagePath)
  const blob = await put(QR_PATH, buffer, {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'image/jpeg',
  })

  console.log('上传成功:', blob.url)
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
