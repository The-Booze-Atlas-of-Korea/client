import httpClient, { ApiCall } from '@/api/HttpClient'
import { handleUnauthorized } from '@/api/utils/unauthorized'
import type { ApiResult } from '@/api/ApiResult'
import type {
  Schedule,
  CreateScheduleRequest,
  ScheduleHistoryResponse,
} from './types'

/**
 * Schedule API module
 * Wraps Schedule-related backend endpoints
 */
export const ScheduleApi = {
  /**
   * Create a new schedule from a plan
   * POST /schedules
   */
  async createSchedule(
    payload: CreateScheduleRequest,
  ): Promise<ApiResult<Schedule>> {
    const res = await ApiCall<Schedule>(() =>
      httpClient.post('/schedules', payload),
    )
    return handleUnauthorized(res)
  },

  /**
   * Get schedule history with date range and pagination
   * GET /schedules/history?from=&to=&page=&size=
   */
  async getScheduleHistory(params: {
    from?: string
    to?: string
    page?: number
    size?: number
  }): Promise<ApiResult<ScheduleHistoryResponse>> {
    const res = await ApiCall<ScheduleHistoryResponse>(() =>
      httpClient.get('/schedules/history', { params }),
    )
    return handleUnauthorized(res)
  },
}
