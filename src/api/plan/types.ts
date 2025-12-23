// Plan/Schedule/Calendar API Types
// Minimal DTOs based on backend API contract (verified against master branch)

/**
 * Spot (location/place) within a plan
 * Backend: PlanSpotRequest.java
 */
export interface PlanSpot {
  placeId?: number // nullable - 사용자가 직접 입력한 장소일 수 있음
  placeNameSnapshot: string
  placeAddressSnapshot?: string
  latitude?: number
  longitude?: number
  sequence: number
  memo?: string
}

/**
 * Plan entity (응답)
 * 백엔드는 id를 반환하지만, 일부 API는 planId를 사용할 수 있음
 */
export interface Plan {
  id?: number // 백엔드 응답 필드
  planId?: number // 일부 API에서 사용
  title?: string
  description?: string
  theme?: string
  totalBudget?: number
  spots?: PlanSpot[]
  createdAt?: string
  updatedAt?: string
}

/**
 * Request DTO for creating a plan
 * Backend: CreatePlanRequest.java
 */
export interface CreatePlanRequest {
  title: string
  description?: string
  theme?: string
  totalBudget?: number
  spots?: Omit<PlanSpot, 'id'>[]
}

/**
 * Request DTO for updating a plan (PATCH - 모든 필드 optional)
 * Backend: UpdatePlanRequest.java
 */
export interface UpdatePlanRequest {
  title?: string
  description?: string
  theme?: string
  totalBudget?: number
  spots?: Omit<PlanSpot, 'id'>[]
}

/**
 * Paginated plan list response
 */
export interface PlanListResponse {
  content?: Plan[]
  page?: number
  size?: number
  totalElements?: number
  totalPages?: number
}

/**
 * Vote request payload
 */
export interface VoteRequest {
  vote: boolean
}

/**
 * Schedule entity
 */
export interface Schedule {
  scheduleId?: number
  planId?: number
  title?: string
  type?: string
  startAt?: string
  endAt?: string
  reminders?: string[]
}

/**
 * Request DTO for creating a schedule
 */
export interface CreateScheduleRequest {
  planId: number
  title: string
  type?: string
  startAt: string
  endAt: string
  reminders?: string[]
}

/**
 * Schedule history item
 */
export interface ScheduleHistoryItem {
  scheduleId?: number
  planId?: number
  title?: string
  startAt?: string
  endAt?: string
}

/**
 * Paginated schedule history response
 */
export interface ScheduleHistoryResponse {
  content?: ScheduleHistoryItem[]
  page?: number
  size?: number
  totalElements?: number
  totalPages?: number
}

/**
 * Calendar event representation
 */
export interface CalendarEvent {
  scheduleId?: number
  title?: string
  date?: string
  startAt?: string
  endAt?: string
  type?: string
}

/**
 * Monthly calendar response
 */
export interface MonthlyCalendar {
  year?: number
  month?: number
  events?: CalendarEvent[]
}

/**
 * Daily calendar response
 */
export interface DailyCalendar {
  date?: string
  events?: CalendarEvent[]
}

/**
 * Event detail response
 */
export interface EventDetail {
  scheduleId?: number
  planId?: number
  title?: string
  description?: string
  startAt?: string
  endAt?: string
  type?: string
  spots?: PlanSpot[]
}
