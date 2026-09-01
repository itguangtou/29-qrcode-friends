<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { SITE_TITLE } from '@/constants'

const AUTH_KEY = 'adminAuthed'

const authed = ref(false)
const password = ref('')
const loginError = ref('')
const loginLoading = ref(false)

const previewUrl = ref('/default-qr.svg')
const selectedFile = ref<File | null>(null)
const uploadError = ref('')
const uploadSuccess = ref('')
const uploadLoading = ref(false)

onMounted(async () => {
  authed.value = sessionStorage.getItem(AUTH_KEY) === 'true'
  await loadPreview()
})

async function loadPreview() {
  try {
    const res = await fetch('/api/qr')
    if (res.ok) {
      const data = (await res.json()) as { url: string }
      if (data.url) {
        previewUrl.value = data.url
      }
    }
  } catch {
    // ignore
  }
}

async function handleLogin() {
  loginError.value = ''
  loginLoading.value = true
  try {
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: password.value }),
    })
    if (!res.ok) {
      const data = (await res.json().catch(() => ({}))) as { error?: string }
      loginError.value = data.error ?? '登录失败'
      return
    }
    sessionStorage.setItem(AUTH_KEY, 'true')
    authed.value = true
    password.value = ''
  } catch {
    loginError.value = '网络错误，请重试'
  } finally {
    loginLoading.value = false
  }
}

function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement
  selectedFile.value = input.files?.[0] ?? null
  uploadError.value = ''
  uploadSuccess.value = ''
}

async function handleUpload() {
  if (!selectedFile.value) {
    uploadError.value = '请选择图片'
    return
  }
  if (!password.value) {
    uploadError.value = '请输入密码以确认上传'
    return
  }

  uploadError.value = ''
  uploadSuccess.value = ''
  uploadLoading.value = true

  try {
    const formData = new FormData()
    formData.append('password', password.value)
    formData.append('file', selectedFile.value)

    const res = await fetch('/api/admin/qr', {
      method: 'PUT',
      body: formData,
    })

    const data = (await res.json().catch(() => ({}))) as { error?: string; url?: string }
    if (!res.ok) {
      uploadError.value = data.error ?? '上传失败'
      return
    }

    uploadSuccess.value = '上传成功'
    if (data.url) {
      previewUrl.value = data.url
    } else {
      await loadPreview()
    }
    selectedFile.value = null
  } catch {
    uploadError.value = '网络错误，请重试'
  } finally {
    uploadLoading.value = false
  }
}

function handleLogout() {
  sessionStorage.removeItem(AUTH_KEY)
  authed.value = false
  password.value = ''
  uploadError.value = ''
  uploadSuccess.value = ''
}
</script>

<template>
  <div class="admin-page">
    <div class="admin-card">
      <h1>管理后台</h1>
      <p class="subtitle">{{ SITE_TITLE }}</p>

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
        <p v-if="loginError" class="error">{{ loginError }}</p>
        <button class="btn primary" :disabled="loginLoading" @click="handleLogin">
          {{ loginLoading ? '登录中...' : '登录' }}
        </button>
      </template>

      <template v-else>
        <div class="preview">
          <p class="label">当前二维码</p>
          <img :src="previewUrl" alt="当前二维码" class="preview-img" />
        </div>

        <label class="label" for="upload-password">确认密码</label>
        <input
          id="upload-password"
          v-model="password"
          type="password"
          class="input"
          placeholder="上传前再次输入密码"
        />

        <label class="label" for="qr-file">新二维码图片</label>
        <input id="qr-file" type="file" accept="image/png,image/jpeg,image/jpg" @change="handleFileChange" />

        <p v-if="uploadError" class="error">{{ uploadError }}</p>
        <p v-if="uploadSuccess" class="success">{{ uploadSuccess }}</p>

        <div class="actions">
          <button class="btn primary" :disabled="uploadLoading" @click="handleUpload">
            {{ uploadLoading ? '上传中...' : '上传替换' }}
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

h1 {
  margin: 0 0 4px;
  font-size: 22px;
}

.subtitle {
  margin: 0 0 24px;
  color: #666;
  font-size: 14px;
}

.label {
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  color: #333;
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

.preview-img {
  width: 200px;
  height: 200px;
  object-fit: contain;
  border: 1px solid #eee;
  border-radius: 8px;
  display: block;
}

.actions {
  display: flex;
  gap: 12px;
  margin-top: 8px;
}

.btn {
  padding: 10px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
  cursor: pointer;
  font-size: 14px;
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

.error {
  color: #e53935;
  font-size: 13px;
  margin: 0 0 12px;
}

.success {
  color: #07c160;
  font-size: 13px;
  margin: 0 0 12px;
}
</style>
