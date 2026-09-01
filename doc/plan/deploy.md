# Vercel 上线流程

本文说明如何将本项目部署到 Vercel，以及 AI 助手可代为操作的部分。

## 当前状态

| 项目 | 状态 |
|------|------|
| GitHub 仓库 | https://github.com/itguangtou/29-qrcode-friends |
| Vercel 项目 | 已部署（Root Directory = `qrcode-friends-web`） |
| 管理端 | 代码已就绪，需在 Vercel 配置 Blob + 密码，见 [admin.md](admin.md) |

---

## 静态版上线（已完成）

若只需展示固定二维码、不用管理端，部署时**无需** Blob 和环境变量。二维码来自 `public/qrcode.jpg`（GitHub）。

---

## 启用管理端

详见 **[doc/plan/admin.md](admin.md)**，核心三步：

1. Vercel **Storage** 创建 Blob Store
2. 设置 `ADMIN_PASSWORD` 环境变量
3. **Redeploy** 一次

---

## 首次部署（参考）

### 第 1 步：导入 GitHub 仓库

1. 打开 https://vercel.com/new
2. 点击 **Import** 旁边的 GitHub 仓库 `itguangtou/29-qrcode-friends`
3. 若看不到仓库，点 **Adjust GitHub App Permissions** 授权该仓库

### 第 2 步：配置构建设置

在 Import 页面填写：

| 配置项 | 值 |
|--------|-----|
| **Root Directory** | `qrcode-friends-web`（重要！代码在子目录） |
| **Framework Preset** | Vite（通常自动识别） |
| **Build Command** | `pnpm build` |
| **Output Directory** | `dist` |

### 第 3 步：创建 Blob 存储

1. 部署前或部署后，进入项目 → **Storage** 标签
2. 点击 **Create Database** → 选择 **Blob**
3. 命名如 `qrcode-blob`，连接到当前项目
4. Vercel 会自动注入 `BLOB_READ_WRITE_TOKEN` 环境变量

### 第 4 步：配置环境变量

进入项目 → **Settings** → **Environment Variables**，添加：

| Name | Value | Environment |
|------|-------|-------------|
| `ADMIN_PASSWORD` | 你自定的管理密码 | Production, Preview, Development |

`BLOB_READ_WRITE_TOKEN` 在创建 Blob Store 并连接项目后会自动出现，无需手动添加。

### 第 5 步：部署

点击 **Deploy**，等待构建完成。

部署成功后访问：
- 首页：`https://你的项目名.vercel.app/`
- 管理页：`https://你的项目名.vercel.app/admin`

### 第 6 步：上传第一张二维码

**方式 A（推荐，已内置图片）**：项目已将 `doc/image/` 下的微信二维码复制到 `public/qrcode.jpg`，部署后首页会直接显示，无需额外操作。

**方式 B（上传到 Blob，便于后续管理端替换）**：部署完成后在本地运行：

```bash
cd qrcode-friends-web
# 从 Vercel 项目 Settings → Environment Variables 复制 BLOB_READ_WRITE_TOKEN
pnpm seed
```

**方式 C**：打开 `/admin` 登录后手动上传。

---

## 方式二：AI 代为操作（需提供 Vercel Token）

如果你希望 AI 通过命令行帮你创建项目、配置环境变量，需要提供：

### 你需要提供的信息

1. **Vercel Access Token**
   - 获取路径：https://vercel.com/account/tokens
   - 点击 **Create Token**，Scope 选 Full Account 或至少包含该项目权限
   - 将 token 发给我（用完后可在 Vercel 删除）

2. **管理密码**（`ADMIN_PASSWORD`）
   - 你打算用的管理后台密码

3. **（可选）自定义域名**
   - 如有自己的域名，告知域名以便配置

### AI 可代为执行的命令

```bash
# 安装 Vercel CLI
pnpm add -g vercel

# 使用 token 登录（非交互）
vercel login --token <你的TOKEN>

# 在 qrcode-friends-web 目录关联并部署
cd qrcode-friends-web
vercel link --yes
vercel env add ADMIN_PASSWORD production
vercel --prod
```

Blob Store 目前仍需在 Vercel 网页 **Storage** 中创建一次（CLI 对 Blob 绑定支持有限），创建后重新部署即可。

### GitHub 部分 AI 已可自动完成

- `git push` 推送代码到 `itguangtou/29-qrcode-friends`
- 代码 push 后，若 Vercel 已关联仓库，会自动触发重新部署

---

## 日常更新流程

```
改代码 → git commit → git push → Vercel 自动部署
换二维码 → 登录 /admin 上传 → 无需重新部署
改标题   → 改 constants.ts → push → 自动部署
改密码   → Vercel 环境变量改 ADMIN_PASSWORD → 重新部署
```

---

## 常见问题

### 首页显示占位图，不是真实二维码

- 尚未通过 `/admin` 上传过图片
- Blob Store 未创建或未连接到项目
- 检查 Vercel 项目环境变量中是否有 `BLOB_READ_WRITE_TOKEN`

### API 404

- 确认 Root Directory 设为 `qrcode-friends-web`（`api/` 目录在此下）
- 确认 `vercel.json` 已提交到仓库

### 本地开发看不到 API

- `pnpm dev` 只启动 Vite 前端，不含 Serverless API
- 本地测试 API 需安装 Vercel CLI 后运行：`vercel dev`（在 `qrcode-friends-web` 目录）

---

## 检查清单

- [ ] GitHub 代码已 push
- [ ] Vercel 导入仓库，Root Directory = `qrcode-friends-web`
- [ ] 创建 Blob Store 并连接项目
- [ ] 设置 `ADMIN_PASSWORD`
- [ ] 首次部署成功
- [ ] `/admin` 登录并上传二维码
- [ ] 首页显示正确二维码
