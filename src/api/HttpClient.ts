import axios from 'axios';

const httpClient = axios.create({
  baseURL: 'http://localhost:8080/api', // 백엔드 주소 (예: Spring Boot)
  timeout: 5000,
  withCredentials: true, // 세션/쿠키 쓰면 true
});

// 요청/응답 인터셉터도 여기서 추가 가능
// httpClient.interceptors.request.use(config => { ...; return config; });

export default httpClient;
