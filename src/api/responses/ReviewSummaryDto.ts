/**
 * 리뷰 요약 통계 응답 DTO
 * 서버의 ReviewSummaryResponse에 대응
 */
export interface ReviewSummaryDto {
  /** 총 리뷰 개수 */
  totalCount: number

  /** 평균 별점 (0.0 ~ 5.0) */
  averageRating: number

  /** 별점 분포 { 1: 10, 2: 5, 3: 20, 4: 30, 5: 15 } */
  ratingDistribution: Record<number, number>
}
