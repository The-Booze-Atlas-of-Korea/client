export interface BarListItemDto {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  baseCategoryName: string
  openInformation: string

  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

/** POST /api/bars/nearby response body :contentReference[oaicite:6]{index=6} */
export type FindNearbyBarsResponseDto = BarListItemDto[]
