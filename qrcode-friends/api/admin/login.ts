export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { password?: string }

    if (!process.env.ADMIN_PASSWORD || body.password !== process.env.ADMIN_PASSWORD) {
      return Response.json({ error: '密码错误' }, { status: 401 })
    }

    return Response.json({ ok: true })
  } catch {
    return Response.json({ error: '请求无效' }, { status: 400 })
  }
}
