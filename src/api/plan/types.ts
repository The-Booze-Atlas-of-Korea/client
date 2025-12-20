// Plan/Schedule/Calendar API Types
// Minimal DTOs based on backend API contract

/**
 * Spot (location) within a plan
 */
export interface Spot {
  id?: number
  name: string
  address?: string
  order: number
}

/**
 * Plan entity
 */
export interface Plan {
  id: number
  title: string
  description?: string
  theme?: string
  budget?: number
  spots: Spot[]
  createdAt?: string
  updatedAt?: string
}

/**
 * Request DTO for creating a plan
 */
export interface CreatePlanRequest {
  title: string
  description?: string
  theme?: string
  budget?: number
  spots: Omit<Spot, 'id'>[]
}

/**
 * Request DTO for updating a plan
 */
export interface UpdatePlanRequest {
  title?: string
  description?: string
  theme?: string
  budget?: number
  spots?: Omit<Spot, 'id'>[]
}

/**
 * Paginated plan list response
 */
export interface PlanListResponse {
  content: Plan[]
  page: number
  size: number
  totalElements: number
  totalPages: number
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
  id: number
  planId: number
  title: string
  type?: string
  startAt: string
  endAt: string
  reminders?: string[]
  createdAt?: string
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
  id: number
  planId?: number
  title: string
  startAt: string
  endAt: string
}

/**
 * Paginated schedule history response
 */
export interface ScheduleHistoryResponse {
  content: ScheduleHistoryItem[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

/**
 * Calendar event representation
 */
export interface CalendarEvent {
  scheduleId: number
  title: string
  date: string
  startAt?: string
  endAt?: string
  type?: string
}

/**
 * Monthly calendar response
 */
export interface MonthlyCalendar {
  year: number
  month: number
  events: CalendarEvent[]
}

/**
 * Daily calendar response
 */
export interface DailyCalendar {
  date: string
  events: CalendarEvent[]
}

/**
 * Event detail response
 */
export interface EventDetail {
  scheduleId: number
  planId?: number
  title: string
  description?: string
  startAt: string
  endAt: string
  type?: string
  spots?: Spot[]
}
