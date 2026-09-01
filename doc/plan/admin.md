# 启用管理端

管理端代码已在仓库中，访问 `/admin` 即可。要在生产环境正常使用，需在 Vercel 完成以下配置。

## 图片存在哪里？

| 存储 | 位置 | 说明 |
|------|------|------|
| **GitHub** | `qrcode-friends-web/public/qrcode.jpg` | 构建时打包，Blob 无图时的默认回退 |
| **Vercel Blob** | `qrcode/current.jpg` | 管理端上传后的正式存储；每次上传会先删掉旧图，始终只保留一张 |

- 现在首页显示的图 → 来自 GitHub 静态文件
- 管理端上传换图后 → 存在 Vercel Blob，**无需 git push**
- 换图不触发重新部署

## 启用步骤（约 5 分钟）

### 1. 创建 Blob Store

1. Vercel 项目 → **Storage**
2. **Create Database** → 选 **Blob**
3. 命名（如 `qrcode-blob`）→ 连接到当前项目
4. 自动注入 `BLOB_READ_WRITE_TOKEN`

### 2. 设置管理密码

**Settings** → **Environment Variables** → 添加：

```
ADMIN_PASSWORD = 你自定的密码
```

Environment 勾选 Production、Preview、Development。

### 3. 重新部署（必须）

环境变量保存后：

**Deployments** → 最新部署 → **⋯** → **Redeploy**

不 Redeploy，新环境变量不会生效。

### 4. 验证

1. 打开 `https://你的域名.vercel.app/admin`
2. 输入密码登录
3. 上传新二维码
4. 刷新首页确认更新

### 5.（可选）同步默认图到 Blob

```bash
cd qrcode-friends-web
# 从 Vercel Settings → Environment Variables 复制 BLOB_READ_WRITE_TOKEN
$env:BLOB_READ_WRITE_TOKEN="你的token"
pnpm seed
```

## 日常使用

| 操作 | 做法 |
|------|------|
| 换二维码 | `/admin` 上传，无需部署 |
| 改管理密码 | Vercel 改 `ADMIN_PASSWORD` → Redeploy |
| 改标题 | 改 `src/constants.ts` → git push |
| 改前端 | git push，自动部署 |

## 故障排查

| 现象 | 原因 | 解决 |
|------|------|------|
| 登录提示「管理端未配置」 | 未设 `ADMIN_PASSWORD` 或未 Redeploy | 设变量后 Redeploy |
| 上传提示「存储未配置」 | 未创建 Blob Store | Storage 创建 Blob 并连接项目 |
| 上传失败 | Blob 未连接或 token 无效 | 检查 `BLOB_READ_WRITE_TOKEN` 存在 |
| 首页仍显示旧图 | 浏览器缓存 | 强制刷新或无痕模式 |
