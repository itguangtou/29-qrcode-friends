# 二维码单页项目规划

## 目标

移动端单页：固定标题「老卫今日作业」+ 微信群二维码展示。管理员通过 `/admin` 登录后上传替换二维码（固定一张，覆盖更新）。

## 架构

- **前端**：Vue 3 + Vite（`qrcode-friends/`）
- **存储**：Vercel Blob，固定路径 `qrcode/current.png`
- **鉴权**：环境变量 `ADMIN_PASSWORD`
- **API**：Vercel Serverless Functions（`api/` 目录）
- **无需数据库**

## API

| 端点 | 方法 | 说明 |
|------|------|------|
| `/api/qr` | GET | 返回二维码图片 URL |
| `/api/admin/login` | POST | 校验管理密码 |
| `/api/admin/qr` | PUT | 上传替换二维码 |

## 环境变量

| 变量 | 说明 |
|------|------|
| `ADMIN_PASSWORD` | 管理登录密码 |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 读写令牌（创建 Blob Store 后自动注入） |

## 改标题

修改 `src/constants.ts` 中的 `SITE_TITLE`，重新部署即可。
