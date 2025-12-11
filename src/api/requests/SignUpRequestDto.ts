/*
{
  "loginId": "user1234",
  "password": "P@ssw0rd!",
  "name": "홍길동",
  "email": "user@example.com",
  "phone": "010-1234-5678",
  "address": "서울특별시 어딘가 123",
  "birthday": "1995-06-01",
  "gender": "M"
}
*/

export interface SignUpRequestDto {
  loginId: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  email: string;
  birthday: string;
  gender: string;
}
