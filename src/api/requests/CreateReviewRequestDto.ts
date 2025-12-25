/**
 * 리뷰 작성 요청 DTO
 * 서버의 CreateReviewRequest에 대응
 */
export interface CreateReviewRequestDto {
  /** 별점 (1~5, 필수) */
  rating: number

  /** 리뷰 내용 (필수) */
  content: string

  /** 첨부 미디어 URL 목록 (선택) */
  mediaUrls?: string[]
}
