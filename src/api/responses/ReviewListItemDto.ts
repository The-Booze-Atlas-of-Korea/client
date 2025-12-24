/**
 * 리뷰 목록 항목 응답 DTO
 * 서버의 ReviewListItemResponse에 대응
 */
export interface ReviewListItemDto {
  /** 리뷰 ID */
  id: number

  /** 작성자 ID */
  userId: number

  /** 별점 (1~5) */
  rating: number

  /** 리뷰 내용 */
  content: string

  /** 첨부 미디어 URL 목록 */
  mediaUrls: string[]

  /** 작성일시 (ISO 8601) */
  createdAt: string
}
