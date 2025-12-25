/**
 * 리뷰 상세 응답 DTO
 * 서버의 ReviewDetailResponse에 대응
 * MVP에서는 ReviewListItemDto와 동일한 구조
 */
export interface ReviewDetailDto {
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
