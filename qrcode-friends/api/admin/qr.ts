import { put } from '@vercel/blob'

const QR_PATH = 'qrcode/current.png'
const MAX_SIZE = 2 * 1024 * 1024

export async function PUT(request: Request) {
  try {
    const formData = await request.formData()
    const password = formData.get('password')
    const file = formData.get('file')

    if (!process.env.ADMIN_PASSWORD || password !== process.env.ADMIN_PASSWORD) {
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
  } catch {
    return Response.json({ error: '上传失败' }, { status: 500 })
  }
}
