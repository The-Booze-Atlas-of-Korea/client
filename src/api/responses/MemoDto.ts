/**
 * 메모 응답 DTO
 * 서버의 MemoResponse에 대응
 */
export interface MemoDto {
  /** 메모 ID */
  id: number

  /** 메모 내용 */
  content: string

  /** 작성일시 (ISO 8601) */
  createdAt: string

  /** 수정일시 (ISO 8601) */
  updatedAt: string
}
