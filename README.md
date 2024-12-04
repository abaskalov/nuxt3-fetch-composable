**Secure Token Transmission and Refresh in a Nuxt 3 Application**

When interacting between the frontend and backend, it is essential to securely transmit tokens for authorization and refresh them in a timely manner. An expired token must be refreshed, otherwise, the user session must be terminated to protect data.

**Solution**

I use HTTP request headers for token transmission. Tokens have a limited lifespan, and a dedicated backend endpoint is implemented for their refresh, accepting the current token and refresh code. This allows users to stay logged in without the need for repeated logins.

To separate business logic from authorization logic, I created a composable called **useApiRest**. It automatically adds the token to each request header and handles its refresh when a 401 error occurs.

**Using useApiRest**

```javascript
const data = await useApiRest<ResultType>('/endpoint', { method: 'post', body: { foo: 1 }});
```

**Step-by-Step Workflow of useApiRest**

1. **Adding Headers**: For each request, **useApiRest** adds the current token to the `x-authorization` header, if it is available in **authStore**.
2. **Handling 401 Error**: If the server returns a 401 status (invalid token), **useApiRest** checks for the token and refresh code. If they are present, it retries the request to refresh the token.
3. **Refreshing the Token**: If the refresh is successful, the new token and refresh code are saved in **authStore**, ensuring continuous authorization.
4. **Logging Out**: If the token refresh fails (e.g., the server returns a 400 or 401 error), the user session is terminated, and authorization data is cleared.

**Implementation of useApiRest**

```javascript
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
```

**Pros and Cons**

**Pros:**
- **Ease of Use**: The token is automatically added to each request, simplifying authorization.
- **Security**: Tokens have a limited lifespan, reducing the risk of compromise.
- **Separation of Concerns**: **useApiRest** separates authorization logic from business logic, improving code structure.

**Cons:**
- **Increased Response Time**: Token refresh requires an additional request, which may slow down response time.
- **Dependence on Connection Stability**: If the user loses connection, the token refresh may fail, requiring a re-login.

This approach ensures reliable and secure authorization, enhancing the interaction between the frontend and backend, but requires careful error handling and connection recovery.
