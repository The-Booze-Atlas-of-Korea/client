/** POST /ai/recommend-bars */
export interface GetRecommendedBarsRequestDto {
  /** 위도 (-90 ~ 90) */
  lat: number
  /** 경도 (-180 ~ 180) */
  lon: number
  /** meters (50 ~ 20000) */
  maxDistance: number
  /** 1 ~ 300 chars, not blank */
  userPrompt: string
}
