<script setup lang="ts">
import { onMounted, ref } from 'vue'
import QrCard from '@/components/QrCard.vue'
import { SITE_TITLE } from '@/constants'

const qrImageUrl = ref<string | null>(null)
const loading = ref(true)

onMounted(async () => {
  try {
    const res = await fetch(`/api/qr?t=${Date.now()}`, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })
    if (res.ok) {
      const data = (await res.json()) as { url: string | null }
      if (data.url) {
        qrImageUrl.value = `${data.url}${data.url.includes('?') ? '&' : '?'}t=${Date.now()}`
      } else {
        qrImageUrl.value = null
      }
    }
  } catch {
    qrImageUrl.value = null
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <QrCard :title="SITE_TITLE" :qr-image-url="qrImageUrl" :loading="loading" />
</template>
