<script setup lang="ts">
import { messageState, close, type MessageType } from '@/utils/message'

function getIcon(type: MessageType) {
  switch (type) {
    case 'success':
      return '✓'
    case 'error':
      return '✕'
    case 'warning':
      return '!'
    case 'info':
    default:
      return 'i'
  }
}
</script>

<template>
  <div class="message-container">
    <TransitionGroup name="msg-slide">
      <div
        v-for="item in messageState.messages"
        :key="item.id"
        class="message-item"
        :class="item.type"
      >
        <span class="message-icon">{{ getIcon(item.type) }}</span>
        <span class="message-content">{{ item.content }}</span>
        <button class="message-close" @click="close(item.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.message-container {
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  pointer-events: none;
  width: max-content;
  max-width: 90vw;
}

.message-item {
  pointer-events: auto;
  display: inline-flex;
  align-items: center;
  padding: 10px 18px;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  font-size: 14px;
  line-height: 1.4;
  background: #fff;
  border: 1px solid transparent;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.message-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 12px;
  font-weight: bold;
  margin-right: 8px;
  flex-shrink: 0;
}

.message-content {
  color: #333;
  margin-right: 12px;
  word-break: break-word;
}

.message-close {
  background: none;
  border: none;
  color: #999;
  font-size: 16px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.message-close:hover {
  color: #666;
}

/* 样式类型 */
.message-item.success {
  background: #f6ffed;
  border-color: #b7eb8f;
}
.message-item.success .message-icon {
  background: #52c41a;
  color: #fff;
}
.message-item.success .message-content {
  color: #274916;
}

.message-item.error {
  background: #fff2f0;
  border-color: #ffccc7;
}
.message-item.error .message-icon {
  background: #ff4d4f;
  color: #fff;
}
.message-item.error .message-content {
  color: #5c0011;
}

.message-item.warning {
  background: #fffbe6;
  border-color: #ffe58f;
}
.message-item.warning .message-icon {
  background: #faad14;
  color: #fff;
}
.message-item.warning .message-content {
  color: #614700;
}

.message-item.info {
  background: #e6f4ff;
  border-color: #91caff;
}
.message-item.info .message-icon {
  background: #1677ff;
  color: #fff;
}
.message-item.info .message-content {
  color: #002c8c;
}

/* 动画效果 */
.msg-slide-enter-active,
.msg-slide-leave-active {
  transition: all 0.3s ease;
}

.msg-slide-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.msg-slide-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}
</style>
