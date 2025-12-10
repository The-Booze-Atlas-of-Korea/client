// src/api/userController.ts
import httpClient from '@/api/HttpClient';
import { LoginRequestDto } from './requests/LoginRequestDto';
import { SignUpRequestDto } from './requests/SignUpRequestDto';


// 실제로 백엔드 REST API와 통신하는 계층
export const userController = {
  /*
URL: /auth/login
Method: POST
설명: loginId + password 로 로그인.
인증 성공 시 JSESSIONID 쿠키가 발급되고, 이후 세션 기반으로 인증이 유지된다.
  */
  async login(payload : LoginRequestDto) {
    await httpClient.post('/auth/login', payload);
  },

  /*
URL: /auth/signup
Method: POST
설명: 새 유저를 생성한다.
비밀번호 암호화는 UserService.CreateUser 내부에서 passwordEncoder를 사용해 처리하는 것으로 가정.
  */
  async signup(payload: SignUpRequestDto): Promise<BigInt> {
    const res = await httpClient.post<BigInt>('/auth/signup', payload);
    return res.data;
  },

  // PUT /users/{id}
  async updateUser(
    id: number,
    payload: { name?: string; email?: string },
  ): Promise<User> {
    const res = await httpClient.put<User>(`/users/${id}`, payload);
    return res.data;
  },

  // DELETE /users/{id}
  async deleteUser(id: number): Promise<void> {
    await httpClient.delete(`/users/${id}`);
  },
};
