import { put } from '@vercel/blob'

const QR_PATH = 'qrcode/current.png'
const MAX_SIZE = 2 * 1024 * 1024

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
      return Response.json({ error: '图片不能超过 2MB' }, { status: 400 })
    }

    const blob = await put(QR_PATH, file, {
      access: 'public',
      addRandomSuffix: false,
      contentType: file.type,
    })

    return Response.json({ ok: true, url: `${blob.url}?v=${Date.now()}` })
  } catch (err) {
    console.error('Upload failed:', err)
    return Response.json({ error: '上传失败，请检查 Blob 存储配置' }, { status: 500 })
  }
}
