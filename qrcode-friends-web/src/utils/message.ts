import { reactive } from 'vue'

export type MessageType = 'success' | 'error' | 'warning' | 'info'

export interface MessageItem {
  id: number
  type: MessageType
  content: string
  duration?: number
}

export const messageState = reactive<{
  messages: MessageItem[]
}>({
  messages: [],
})

let nextId = 1

function show(type: MessageType, content: string, duration = 3000) {
  const id = nextId++
  const item: MessageItem = { id, type, content, duration }
  messageState.messages.push(item)

  if (duration > 0) {
    setTimeout(() => {
      close(id)
    }, duration)
  }
  return id
}

export function close(id: number) {
  const index = messageState.messages.findIndex((m) => m.id === id)
  if (index !== -1) {
    messageState.messages.splice(index, 1)
  }
}

export const message = {
  success(content: string, duration = 3000) {
    return show('success', content, duration)
  },
  error(content: string, duration = 3000) {
    return show('error', content, duration)
  },
  warning(content: string, duration = 3000) {
    return show('warning', content, duration)
  },
  info(content: string, duration = 3000) {
    return show('info', content, duration)
  },
  close,
}
