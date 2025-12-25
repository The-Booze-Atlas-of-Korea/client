/**
 * 메모 생성/수정 요청 DTO
 * 서버의 UpsertMemoRequest에 대응
 */
export interface UpsertMemoRequestDto {
  /** 메모 내용 (필수) */
  content: string
}
