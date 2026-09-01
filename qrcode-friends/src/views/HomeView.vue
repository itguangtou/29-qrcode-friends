<script setup lang="ts">
import { onMounted, ref } from 'vue'
import QrCard from '@/components/QrCard.vue'
import { SITE_TITLE } from '@/constants'

const qrImageUrl = ref('/qrcode.jpg')
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch('/api/qr')
    if (res.ok) {
      const data = (await res.json()) as { url: string }
      if (data.url) {
        qrImageUrl.value = data.url
      }
    }
  } catch {
    // 本地开发或未部署 API 时使用默认占位图
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <QrCard :title="SITE_TITLE" :qr-image-url="qrImageUrl" :loading="loading" />
</template>
