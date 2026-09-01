const MAX_EDGE = 1024
const INITIAL_QUALITY = 0.82
const MIN_QUALITY = 0.5
const TARGET_MAX_BYTES = 300 * 1024

function scaleDown(width: number, height: number, maxEdge: number) {
  if (width <= maxEdge && height <= maxEdge) {
    return { width, height }
  }

  const ratio = Math.min(maxEdge / width, maxEdge / height)
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  }
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob)
          return
        }
        reject(new Error('图片压缩失败'))
      },
      'image/jpeg',
      quality,
    )
  })
}

export async function compressImage(file: File): Promise<File> {
  const bitmap = await createImageBitmap(file)
  const { width, height } = scaleDown(bitmap.width, bitmap.height, MAX_EDGE)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    bitmap.close()
    throw new Error('图片压缩失败')
  }

  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  let quality = INITIAL_QUALITY
  let blob = await canvasToBlob(canvas, quality)

  while (blob.size > TARGET_MAX_BYTES && quality > MIN_QUALITY) {
    quality -= 0.08
    blob = await canvasToBlob(canvas, quality)
  }

  return new File([blob], 'qrcode.jpg', {
    type: 'image/jpeg',
    lastModified: Date.now(),
  })
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
