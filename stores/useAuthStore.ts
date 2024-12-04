import { defineStore } from 'pinia'

export const useAuthStore = defineStore('authStore', {
  state: (): {
    token: string | null;
    tokenRefreshCode: string | null;
  } => ({
    token: null,
    tokenRefreshCode: null
  }),
  actions: {
  }
})
