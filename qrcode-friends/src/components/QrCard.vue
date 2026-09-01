<script setup lang="ts">
import WechatIcon from './WechatIcon.vue'

defineProps<{
  title: string
  qrImageUrl: string
  loading?: boolean
}>()
</script>

<template>
  <div class="page">
    <div class="card">
      <div class="card-header">
        <WechatIcon />
        <h1 class="title">{{ title }}</h1>
      </div>
      <div class="qr-wrapper">
        <div v-if="loading" class="qr-placeholder">加载中...</div>
        <img v-else :src="qrImageUrl" alt="微信群二维码" class="qr-image" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px 16px;
  background: #f5f5f5;
}

.card {
  width: min(90vw, 400px);
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.08);
  padding: 28px 24px 32px;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 24px;
}

.title {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a1a;
  line-height: 1.3;
}

.qr-wrapper {
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
}

.qr-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.qr-placeholder {
  color: #999;
  font-size: 14px;
}
</style>
