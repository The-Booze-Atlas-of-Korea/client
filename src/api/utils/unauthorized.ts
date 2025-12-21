import { ApiResult } from '@/api/ApiResult'

/**
 * Redirects to login page with current path as redirect parameter.
 * Uses window.location.assign for navigation (not Vue Router).
 */
export function redirectToLogin(): void {
  const currentPath = window.location.pathname + window.location.search
  const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`
  window.location.assign(redirectUrl)
}

/**
 * Handles 401 Unauthorized responses by redirecting to login.
 * Returns the original result unchanged for all other cases.
 *
 * @param res - ApiResult to check for 401 status
 * @returns Original ApiResult (or redirects if 401)
 */
export function handleUnauthorized<T>(res: ApiResult<T>): ApiResult<T> {
  if (!res.ok && res.error.status === 401) {
    redirectToLogin()
  }
  return res
}
