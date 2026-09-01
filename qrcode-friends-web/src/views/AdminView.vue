<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { SITE_TITLE } from '@/constants'
import { compressImage, formatFileSize } from '@/utils/compressImage'
import { message } from '@/utils/message'

const AUTH_KEY = 'adminAuthed'
const PASSWORD_KEY = 'adminPassword'

const authed = ref(false)
const password = ref('')
const loginLoading = ref(false)

const previewUrl = ref<string | null>(null)
const previewKey = ref(0)
const selectedFile = ref<File | null>(null)
const selectedPreviewUrl = ref('')
const fileInputRef = ref<HTMLInputElement | null>(null)
const uploadLoading = ref(false)
const compressing = ref(false)
const compressedSizeLabel = ref('')

onMounted(async () => {
  const savedPassword = sessionStorage.getItem(PASSWORD_KEY)
  authed.value = sessionStorage.getItem(AUTH_KEY) === 'true' && !!savedPassword
  if (!authed.value) {
    clearSession()
  }
  await loadPreview()
})

function clearSession() {
  sessionStorage.removeItem(AUTH_KEY)
  sessionStorage.removeItem(PASSWORD_KEY)
  authed.value = false
}

function withCacheBuster(url: string) {
  const base = url.split('?')[0] ?? url
  return `${base}?t=${Date.now()}`
}

function refreshPreview(url: string) {
  previewUrl.value = withCacheBuster(url)
  previewKey.value += 1
}

async function loadPreview() {
  try {
    const res = await fetch(`/api/qr?t=${Date.now()}`, {
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' },
    })
    if (res.ok) {
      const data = (await res.json()) as { url: string | null }
      if (data.url) {
        refreshPreview(data.url)
      } else {
        previewUrl.value = null
      }
    }
  } catch {
    previewUrl.value = null
  }
}

async function handleLogin() {
  if (!password.value.trim()) {
    message.warning('请输入管理密码')
    return
  }

  loginLoading.value = true
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value }),
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      message.error(data.error ?? '密码错误，登录失败')
      return
    }
    sessionStorage.setItem(AUTH_KEY, 'true')
    sessionStorage.setItem(PASSWORD_KEY, password.value)
    authed.value = true
    password.value = ''
    message.success('登录成功')
    await loadPreview()
  } catch {
    message.error('网络连接异常，请重试')
  } finally {
    loginLoading.value = false
  }
}

function setSelectedFile(file: File | null, sizeLabel = '') {
  if (selectedPreviewUrl.value) {
    URL.revokeObjectURL(selectedPreviewUrl.value)
  }
  selectedFile.value = file
  selectedPreviewUrl.value = file ? URL.createObjectURL(file) : ''
  compressedSizeLabel.value = sizeLabel
}

async function processSelectedFile(file: File) {
  compressing.value = true
  try {
    const compressed = await compressImage(file)
    setSelectedFile(compressed, `压缩后 ${formatFileSize(compressed.size)}`)
  } catch {
    message.error('图片处理失败，请换一张图片重试')
    clearSelectedFile()
  } finally {
    compressing.value = false
  }
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) {
    void processSelectedFile(file)
  }
}

function handleDrop(event: DragEvent) {
  const file = event.dataTransfer?.files?.[0]
  if (file && file.type.startsWith('image/')) {
    void processSelectedFile(file)
  }
}

function openFilePicker() {
  fileInputRef.value?.click()
}

function clearSelectedFile() {
  setSelectedFile(null)
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
}

async function handleUpload() {
  const savedPassword = sessionStorage.getItem(PASSWORD_KEY)
  if (!savedPassword) {
    clearSession()
    message.error('登录已失效，请重新登录')
    return
  }

  if (!selectedFile.value) {
    message.warning('请先选择二维码图片')
    return
  }

  uploadLoading.value = true

  try {
    const formData = new FormData()
    formData.append('password', savedPassword)
    formData.append('file', selectedFile.value)

    const res = await fetch('/api/admin/qr', {
      method: 'PUT',
      body: formData,
      headers: { 'Cache-Control': 'no-cache' },
    })

    const data = (await res.json().catch(() => ({}))) as { error?: string; url?: string }
    if (!res.ok) {
      message.error(data.error ?? '上传失败')
      if (res.status === 401) {
        clearSession()
      }
      return
    }

    message.success('二维码上传成功，页面已更新！')
    clearSelectedFile()

    if (data.url) {
      refreshPreview(data.url)
    } else {
      await loadPreview()
    }
  } catch {
    message.error('网络请求失败，请检查网络后重试')
  } finally {
    uploadLoading.value = false
  }
}

function handleLogout() {
  clearSession()
  password.value = ''
  clearSelectedFile()
  message.info('已退出登录')
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-card">
      <div class="card-header">
        <h1>管理后台</h1>
        <p class="subtitle">{{ SITE_TITLE }}</p>
      </div>

      <template v-if="!authed">
        <label class="label" for="login-password">管理密码</label>
        <input
          id="login-password"
          v-model="password"
          type="password"
          class="input"
          placeholder="请输入密码"
          @keyup.enter="handleLogin"
        />
        <p class="hint">关闭页面后需重新登录</p>
        <div class="form-actions">
          <button class="btn primary" :disabled="loginLoading" @click="handleLogin">
            {{ loginLoading ? '登录中...' : '登录' }}
          </button>
        </div>
      </template>

      <template v-else>
        <div class="preview">
          <p class="label">当前二维码</p>
          <div class="preview-box">
            <img
              v-if="previewUrl"
              :key="previewKey"
              :src="previewUrl"
              alt="当前二维码"
              class="preview-img"
            />
            <div v-else class="preview-empty">
              <span class="empty-icon">📭</span>
              <p>暂未上传任何二维码</p>
            </div>
          </div>
        </div>

        <p class="label">新二维码图片</p>
        <input
          ref="fileInputRef"
          type="file"
          class="file-input-hidden"
          accept="image/png,image/jpeg,image/jpg"
          @change="handleFileChange"
        />

        <div
          class="upload-zone"
          :class="{ 'has-file': selectedFile }"
          @click="openFilePicker"
          @dragover.prevent
          @drop.prevent="handleDrop"
        >
          <template v-if="compressing">
            <p class="upload-title">正在压缩图片...</p>
          </template>
          <template v-else-if="selectedFile">
            <img :src="selectedPreviewUrl" alt="已选图片预览" class="upload-preview" />
            <p class="upload-filename">{{ compressedSizeLabel || '已压缩，准备上传' }}</p>
            <button type="button" class="upload-change" @click.stop="openFilePicker">重新选择</button>
          </template>
          <template v-else>
            <div class="upload-icon">+</div>
            <p class="upload-title">点击或拖拽图片到此处</p>
            <p class="upload-desc">支持 JPG、PNG，上传前自动压缩为轻量图</p>
          </template>
        </div>

        <div class="actions">
          <button
            class="btn primary"
            :disabled="uploadLoading || compressing || !selectedFile"
            @click="handleUpload"
          >
            {{ uploadLoading ? '上传中...' : compressing ? '压缩中...' : '上传替换' }}
          </button>
          <button class="btn" @click="handleLogout">退出登录</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.admin-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: #f5f5f5;
}

.admin-card {
  width: min(90vw, 420px);
  background: #fff;
  border-radius: 16px;
  padding: 28px 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
}

.card-header {
  text-align: center;
  margin-bottom: 24px;
}

h1 {
  margin: 0 0 4px;
  font-size: 22px;
}

.subtitle {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
}

.hint {
  margin: -8px 0 16px;
  font-size: 12px;
  color: #999;
}

.input {
  width: 100%;
  box-sizing: border-box;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 16px;
  font-size: 14px;
}

.preview {
  margin-bottom: 20px;
}

.preview-box {
  width: 200px;
  height: 200px;
  border: 1px solid #eee;
  border-radius: 8px;
  background: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.preview-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.preview-empty {
  text-align: center;
  color: #999;
  font-size: 13px;
}

.preview-empty .empty-icon {
  font-size: 32px;
  display: block;
  margin-bottom: 6px;
}

.preview-empty p {
  margin: 0;
}

.file-input-hidden {
  display: none;
}

.upload-zone {
  border: 2px dashed #d9d9d9;
  border-radius: 12px;
  padding: 28px 16px;
  text-align: center;
  cursor: pointer;
  background: #fafafa;
  transition: border-color 0.2s, background 0.2s;
  margin-bottom: 16px;
}

.upload-zone:hover {
  border-color: #07c160;
  background: #f6ffed;
}

.upload-zone.has-file {
  padding: 16px;
}

.upload-icon {
  width: 48px;
  height: 48px;
  margin: 0 auto 12px;
  border-radius: 50%;
  background: #e8f8ef;
  color: #07c160;
  font-size: 28px;
  line-height: 48px;
  font-weight: 300;
}

.upload-title {
  margin: 0 0 4px;
  font-size: 15px;
  color: #333;
}

.upload-desc {
  margin: 0;
  font-size: 12px;
  color: #999;
}

.upload-preview {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 8px;
  background: #fff;
  border: 1px solid #eee;
  margin-bottom: 8px;
}

.upload-filename {
  margin: 0 0 8px;
  font-size: 13px;
  color: #666;
  word-break: break-all;
}

.upload-change {
  border: none;
  background: none;
  color: #07c160;
  font-size: 13px;
  cursor: pointer;
  padding: 0;
}

.form-actions,
.actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
}

.form-actions .btn,
.actions .btn {
  min-width: 140px;
  padding: 12px 24px;
  font-size: 15px;
}

.btn {
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
}

.btn.primary {
  background: #07c160;
  border-color: #07c160;
  color: #fff;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
