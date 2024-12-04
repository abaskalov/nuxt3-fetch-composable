import { FetchError, type FetchOptions } from "ofetch";
import { useAuthStore } from "~/stores/useAuthStore";

export const useApiRest = <T>(url: string, fetchOptions: FetchOptions & { method?: 'get' | 'post' } = {}) => {
  const authStore = useAuthStore();

  const logout = () => {
    authStore.$reset();
    console.log('The system has been logged out. Please login again.');
  };

  return $fetch<T>(url, {
    baseURL: useRuntimeConfig().public.REST_API_URL,
    retry: 1,
    retryStatusCodes: [401],
    onRequest({ options }) {
      options.headers = new Headers(authStore.token ? {
        'x-authorization': authStore.token,
      } : {})
    },
    async onResponseError({ response, options }) {
      clearError();

      if (response.status === 401 && authStore.token && authStore.tokenRefreshCode) {
        if (options.retry) {
          try {
            const { token, tokenRefreshCode } = await useApiRest<{ token: string, tokenRefreshCode: string }>('/api/auth/refresh', {
              method: 'post',
              body: {
                tokenRefreshCode: authStore.tokenRefreshCode,
              }
            });

            authStore.token = token;
            authStore.tokenRefreshCode = tokenRefreshCode;
          } catch (e) {
            if (e instanceof FetchError && e.status && [400, 401].includes(e.status)) {
              options.retry = false;
              logout();
            }
          }
        } else {
          logout();
        }
      }
    },
    ...fetchOptions,
  });
};
