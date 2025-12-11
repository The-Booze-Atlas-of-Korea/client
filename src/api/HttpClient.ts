import axios, { AxiosError } from 'axios'

export interface ApiError {
  status: number
  message: string
  code?: string // 백엔드에서 내려주는 에러코드 있으면
}

const httpClient = axios.create({
  baseURL: 'http://localhost:8080/api', // 백엔드 주소 (예: Spring Boot)
  timeout: 5000,
  withCredentials: true, // 세션/쿠키 쓰면 true
});

httpClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // 네트워크 에러 (서버 자체에 안 닿음)
    if (!error.response) {
      const apiError: ApiError = {
        status: 0,
        message: '서버에 연결할 수 없습니다.',
      }
      return Promise.reject(apiError)
    }

    const { status, data } = error.response

    let message = '요청 처리 중 오류가 발생했습니다.'
    let code: string | undefined

    // 백엔드에서 에러 응답을 { message, code } 형태로 내려준다고 가정
    if (data && typeof data === 'object') {
      const anyData = data as any
      if (anyData.message) message = anyData.message
      if (anyData.code) code = anyData.code
    }

    // status 별 기본 메시지 오버라이드
    switch (status) {
      case 400:
        message = message || '요청 값이 올바르지 않습니다.'
        break
      case 401:
        message = message || '로그인 정보가 올바르지 않습니다.'
        break
      case 403:
        message = message || '이 작업을 수행할 권한이 없습니다.'
        break
      case 404:
        message = message || '요청한 리소스를 찾을 수 없습니다.'
        break
      case 409:
        message = message || '이미 존재하는 데이터입니다.'
        break
      case 500:
        message = message || '서버 오류가 발생했습니다.'
        break
    }

    const apiError: ApiError = {
      status,
      message,
      code,
    }

    return Promise.reject(apiError)
  },
)

export default httpClient;
