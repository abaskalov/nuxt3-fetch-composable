// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2024-11-01',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      REST_API_URL: '/',
      REST_API_URL_MOBILE: 'https://mobile.app/',
      isMobile: false
    }
  }
})
