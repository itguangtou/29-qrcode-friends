import { uploadQrBlob, withCacheBuster } from '../lib/qr-blob'

const MAX_SIZE = 512 * 1024

export async function PUT(request: Request) {
  try {
    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return Response.json(
        { error: '存储未配置，请在 Vercel 创建 Blob Store 并连接项目后重新部署' },
        { status: 503 },
      )
    }

    if (!process.env.ADMIN_PASSWORD) {
      return Response.json(
        { error: '管理端未配置，请在 Vercel 设置 ADMIN_PASSWORD 环境变量后重新部署' },
        { status: 503 },
      )
    }

    const formData = await request.formData()
    const password = formData.get('password')
    const file = formData.get('file')

    if (password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: '未授权' }, { status: 401 })
    }

    if (!file || !(file instanceof File)) {
      return Response.json({ error: '请选择图片' }, { status: 400 })
    }

    if (!file.type.startsWith('image/')) {
      return Response.json({ error: '仅支持图片格式' }, { status: 400 })
    }

    if (file.size > MAX_SIZE) {
      return Response.json({ error: '压缩后图片仍然过大，请换一张更小的图片' }, { status: 400 })
    }

    const blob = await uploadQrBlob(file)

    return Response.json({ ok: true, url: withCacheBuster(blob.url) })
  } catch (err) {
    console.error('Upload failed:', err)
    return Response.json({ error: '上传失败，请稍后重试' }, { status: 500 })
  }
}
