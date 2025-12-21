import httpClient, { ApiCall } from '@/api/HttpClient'
import { handleUnauthorized } from '@/api/utils/unauthorized'
import type { ApiResult } from '@/api/ApiResult'
import type { MonthlyCalendar, DailyCalendar, EventDetail } from './types'

/**
 * Calendar API module
 * Wraps Calendar-related backend endpoints
 */
export const CalendarApi = {
  /**
   * Get monthly calendar events
   * GET /calendar/monthly?year=&month=
   */
  async getMonthlyCalendar(
    year: number,
    month: number,
  ): Promise<ApiResult<MonthlyCalendar>> {
    const res = await ApiCall<MonthlyCalendar>(() =>
      httpClient.get('/calendar/monthly', { params: { year, month } }),
    )
    return handleUnauthorized(res)
  },

  /**
   * Get daily calendar events
   * GET /calendar/daily?date=
   */
  async getDailyCalendar(date: string): Promise<ApiResult<DailyCalendar>> {
    const res = await ApiCall<DailyCalendar>(() =>
      httpClient.get('/calendar/daily', { params: { date } }),
    )
    return handleUnauthorized(res)
  },

  /**
   * Get specific event detail
   * GET /calendar/events/{scheduleId}
   */
  async getEventDetail(scheduleId: number): Promise<ApiResult<EventDetail>> {
    const res = await ApiCall<EventDetail>(() =>
      httpClient.get(`/calendar/events/${scheduleId}`),
    )
    return handleUnauthorized(res)
  },
}
