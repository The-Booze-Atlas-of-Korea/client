// src/api/ApiResult.ts

// 백엔드에서 공통으로 내려줄 에러 바디 형태에 맞춰서 조정하면 됨
export interface ApiError {
  /** HTTP status code (0 = 네트워크 에러 등) */
  status: number
  /** 사용자에게 보여줄 에러 메시지 */
  message: string
}

/** 성공 케이스 */
export interface ApiSuccess<T> {
  ok: true
  status: number
  data: T
}

/** 실패 케이스 */
export interface ApiFailure {
  ok: false
  error: ApiError
}

/** API 통신 전용 Result 타입 */
export type ApiResult<T> = ApiSuccess<T> | ApiFailure

/** 타입 가드 */
export const ApiResult = {
  ok<T>(data: T, status = 200): ApiSuccess<T> {
    return { ok: true, status, data }
  },

  fail(error: ApiError): ApiFailure {
    return { ok: false, error }
  },

  isOk<T>(result: ApiResult<T>): result is ApiSuccess<T> {
    return result.ok
  },

  isFail<T>(result: ApiResult<T>): result is ApiFailure {
    return !result.ok
  },

  /** map: 성공 시 data를 변환 */
  map<T, U>(result: ApiResult<T>, fn: (data: T) => U): ApiResult<U> {
    if (result.ok) {
      return {
        ok: true,
        status: result.status,
        data: fn(result.data),
      }
    }
    return result
  },
}
