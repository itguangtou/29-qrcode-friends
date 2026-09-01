<script setup lang="ts">
import WechatIcon from './WechatIcon.vue'

interface Props {
  title: string
  qrImageUrl: string | null
  loading?: boolean
}

defineProps<Props>()
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
        <img v-else-if="qrImageUrl" :src="qrImageUrl" alt="微信群二维码" class="qr-image" />
        <div v-else class="qr-empty">
          <div class="empty-icon">📭</div>
          <p class="empty-text">暂未上传二维码</p>
          <p class="empty-sub">请在管理后台上传最新的微信群二维码</p>
        </div>
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

.qr-empty {
  text-align: center;
  padding: 20px;
}

.empty-icon {
  font-size: 36px;
  margin-bottom: 8px;
}

.empty-text {
  margin: 0 0 4px;
  font-size: 15px;
  font-weight: 500;
  color: #333;
}

.empty-sub {
  margin: 0;
  font-size: 12px;
  color: #999;
}
</style>
