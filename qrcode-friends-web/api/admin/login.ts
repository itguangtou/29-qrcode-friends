export async function POST(request: Request) {
  try {
    if (!process.env.ADMIN_PASSWORD) {
      return Response.json(
        { error: '管理端未配置，请在 Vercel 设置 ADMIN_PASSWORD 环境变量后重新部署' },
        { status: 503 },
      )
    }

    const body = (await request.json()) as { password?: string }

    if (body.password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: '密码错误' }, { status: 401 })
    }

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: '请求无效' }, { status: 400 })
  }
}
