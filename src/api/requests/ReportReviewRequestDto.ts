/**
 * 리뷰 신고 요청 DTO
 * 서버의 ReportReviewRequest에 대응
 */
export interface ReportReviewRequestDto {
  /** 신고 사유 (필수) */
  reason: string
}
