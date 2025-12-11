import axios, { AxiosError, AxiosResponse } from 'axios'
import { ApiError, ApiResult } from '@/api/ApiResult'

const httpClient = axios.create({
  baseURL: 'http://localhost:8888/api', // 백엔드 주소 (예: Spring Boot)
  timeout: 5000,
  withCredentials: true, // 세션/쿠키 쓰면 true
});

export default httpClient

export async function ApiCall<T>(fn: () => Promise<AxiosResponse<T>>): Promise<ApiResult<T>> {
  try {
    const res = await fn()
    return ApiResult.ok(res.data, res.status)
  } catch (err) {
    const axiosError = err as AxiosError

    // 네트워크 에러 (response 자체가 없음)
    if (!axiosError.response) {
      const error: ApiError = {
        status: 0,
        message: '서버에 연결할 수 없습니다.',
      }
      return ApiResult.fail(error)
    }

    const { status } = axiosError.response
    const message = '요청 처리 중 오류가 발생했습니다.'

    const error: ApiError = {
      status,
      message,
    }

    return ApiResult.fail(error)
  }
}


