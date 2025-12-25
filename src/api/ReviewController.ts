import httpClient, { ApiCall } from '@/api/HttpClient'
import { handleUnauthorized } from '@/api/utils/unauthorized'
import type { ApiResult } from '@/api/ApiResult'
import type { ReviewSummaryDto } from '@/api/responses/ReviewSummaryDto'
import type { ReviewListItemDto } from '@/api/responses/ReviewListItemDto'
import type { ReviewDetailDto } from '@/api/responses/ReviewDetailDto'
import type { CreateReviewRequestDto } from '@/api/requests/CreateReviewRequestDto'
import type { UpdateReviewRequestDto } from '@/api/requests/UpdateReviewRequestDto'
import type { ReportReviewRequestDto } from '@/api/requests/ReportReviewRequestDto'

/**
 * 리뷰 API 컨트롤러
 * 리뷰 조회, 작성, 수정, 삭제, 신고 등의 기능 제공
 */
export const ReviewController = {
  /**
   * 술집의 리뷰 요약 통계 조회
   * GET /bars/{barId}/reviews/summary
   */
  async getReviewSummary(barId: number): Promise<ApiResult<ReviewSummaryDto>> {
    const res = await ApiCall<ReviewSummaryDto>(() =>
      httpClient.get(`/bars/${barId}/reviews/summary`),
    )
    return handleUnauthorized(res)
  },

  /**
   * 술집의 리뷰 목록 조회
   * GET /bars/{barId}/reviews
   */
  async listReviews(
    barId: number,
    params?: {
      sort?: string
      page?: number
      size?: number
    },
  ): Promise<ApiResult<ReviewListItemDto[]>> {
    const res = await ApiCall<ReviewListItemDto[]>(() =>
      httpClient.get(`/bars/${barId}/reviews`, { params }),
    )
    return handleUnauthorized(res)
  },

  /**
   * 리뷰 상세 조회
   * GET /reviews/{reviewId}
   */
  async getReviewDetail(reviewId: number): Promise<ApiResult<ReviewDetailDto>> {
    const res = await ApiCall<ReviewDetailDto>(() => httpClient.get(`/reviews/${reviewId}`))
    return handleUnauthorized(res)
  },

  /**
   * 리뷰 작성
   * POST /bars/{barId}/reviews
   */
  async createReview(
    barId: number,
    payload: CreateReviewRequestDto,
  ): Promise<ApiResult<ReviewDetailDto>> {
    const res = await ApiCall<ReviewDetailDto>(() =>
      httpClient.post(`/bars/${barId}/reviews`, payload),
    )
    return handleUnauthorized(res)
  },

  /**
   * 리뷰 수정
   * PATCH /reviews/{reviewId}
   */
  async updateReview(
    reviewId: number,
    payload: UpdateReviewRequestDto,
  ): Promise<ApiResult<ReviewDetailDto>> {
    const res = await ApiCall<ReviewDetailDto>(() =>
      httpClient.patch(`/reviews/${reviewId}`, payload),
    )
    return handleUnauthorized(res)
  },

  /**
   * 리뷰 삭제
   * DELETE /reviews/{reviewId}
   */
  async deleteReview(reviewId: number): Promise<ApiResult<void>> {
    const res = await ApiCall<void>(() => httpClient.delete(`/reviews/${reviewId}`))
    return handleUnauthorized(res)
  },

  /**
   * 내 리뷰 목록 조회
   * GET /users/me/reviews
   */
  async listMyReviews(params?: {
    page?: number
    size?: number
  }): Promise<ApiResult<ReviewListItemDto[]>> {
    const res = await ApiCall<ReviewListItemDto[]>(() =>
      httpClient.get('/users/me/reviews', { params }),
    )
    return handleUnauthorized(res)
  },

  /**
   * 리뷰 신고
   * POST /reviews/{reviewId}/report
   */
  async reportReview(reviewId: number, payload: ReportReviewRequestDto): Promise<ApiResult<void>> {
    const res = await ApiCall<void>(() => httpClient.post(`/reviews/${reviewId}/report`, payload))
    return handleUnauthorized(res)
  },
}
