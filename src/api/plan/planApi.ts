import httpClient, { ApiCall } from '@/api/HttpClient'
import { handleUnauthorized } from '@/api/utils/unauthorized'
import type { ApiResult } from '@/api/ApiResult'
import type {
  Plan,
  CreatePlanRequest,
  UpdatePlanRequest,
  PlanListResponse,
  VoteRequest,
} from './types'

/**
 * Plan API module
 * Wraps Plan-related backend endpoints
 */
export const PlanApi = {
  /**
   * Create a new plan
   * POST /plans
   */
  async createPlan(payload: CreatePlanRequest): Promise<ApiResult<Plan>> {
    const res = await ApiCall<Plan>(() => httpClient.post('/plans', payload))
    return handleUnauthorized(res)
  },

  /**
   * Get plan detail by ID
   * GET /plans/{planId}
   */
  async getPlanDetail(planId: number): Promise<ApiResult<Plan>> {
    const res = await ApiCall<Plan>(() => httpClient.get(`/plans/${planId}`))
    return handleUnauthorized(res)
  },

  /**
   * Update an existing plan
   * PATCH /plans/{planId}
   */
  async updatePlan(
    planId: number,
    payload: UpdatePlanRequest,
  ): Promise<ApiResult<Plan>> {
    const res = await ApiCall<Plan>(() =>
      httpClient.patch(`/plans/${planId}`, payload),
    )
    return handleUnauthorized(res)
  },

  /**
   * Delete a plan
   * DELETE /plans/{planId}
   */
  async deletePlan(planId: number): Promise<ApiResult<void>> {
    const res = await ApiCall<void>(() => httpClient.delete(`/plans/${planId}`))
    return handleUnauthorized(res)
  },

  /**
   * List plans with pagination and sorting
   * GET /plans?sort=&page=&size=
   */
  async listPlans(params?: {
    sort?: string
    page?: number
    size?: number
  }): Promise<ApiResult<PlanListResponse>> {
    const res = await ApiCall<PlanListResponse>(() =>
      httpClient.get('/plans', { params }),
    )
    return handleUnauthorized(res)
  },

  /**
   * Vote on a plan
   * POST /plans/{planId}/votes
   */
  async votePlan(
    planId: number,
    payload: VoteRequest,
  ): Promise<ApiResult<void>> {
    const res = await ApiCall<void>(() =>
      httpClient.post(`/plans/${planId}/votes`, payload),
    )
    return handleUnauthorized(res)
  },
}
