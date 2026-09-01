import { put } from '@vercel/blob'

const QR_PATH = 'qrcode/current.jpg'
const MAX_SIZE = 512 * 1024

const NO_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function PUT(request: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return Response.json(
        { error: '存储未配置，请在 Vercel 创建 Blob Store 并连接项目后重新部署' },
        { status: 503, headers: NO_CACHE_HEADERS },
      )
    }

    if (!process.env.ADMIN_PASSWORD) {
      return Response.json(
        { error: '管理端未配置，请在 Vercel 设置 ADMIN_PASSWORD 环境变量后重新部署' },
        { status: 503, headers: NO_CACHE_HEADERS },
      )
    }

    const formData = await request.formData()
    const password = formData.get('password')
    const file = formData.get('file')

    if (password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: '未授权' }, { status: 401, headers: NO_CACHE_HEADERS })
    }

    if (!file || !(file instanceof File)) {
      return Response.json({ error: '请选择图片' }, { status: 400, headers: NO_CACHE_HEADERS })
    }

    if (!file.type.startsWith('image/')) {
      return Response.json({ error: '仅支持图片格式' }, { status: 400, headers: NO_CACHE_HEADERS })
    }

    if (file.size > MAX_SIZE) {
      return Response.json(
        { error: '压缩后图片仍然过大，请换一张更小的图片' },
        { status: 400, headers: NO_CACHE_HEADERS },
      )
    }

    const blob = await put(QR_PATH, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: 'image/jpeg',
      cacheControlMaxAge: 0,
    })

    return Response.json(
      { ok: true, url: `${blob.url}?v=${Date.now()}` },
      { headers: NO_CACHE_HEADERS },
    )
  } catch (err) {
    console.error('Upload failed:', err)
    return Response.json(
      { error: '上传失败，请检查 Blob 存储配置' },
      { status: 500, headers: NO_CACHE_HEADERS },
    )
  }
}
