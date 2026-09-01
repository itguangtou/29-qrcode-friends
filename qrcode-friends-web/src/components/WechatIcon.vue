<script setup lang="ts">
import wechatIcon from '@/assets/wechat.svg'
</script>

<template>
  <img :src="wechatIcon" alt="" class="wechat-icon" aria-hidden="true" />
</template>

<style scoped>
.wechat-icon {
  width: 28px;
  height: 28px;
  flex-shrink: 0;
  display: block;
}
</style>
