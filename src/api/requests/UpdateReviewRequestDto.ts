/**
 * 리뷰 수정 요청 DTO
 * 서버의 UpdateReviewRequest에 대응
 */
export interface UpdateReviewRequestDto {
  /** 별점 (1~5, 필수) */
  rating: number

  /** 리뷰 내용 (선택) */
  content?: string

  /** 첨부 미디어 URL 목록 (선택) */
  mediaUrls?: string[]
}
