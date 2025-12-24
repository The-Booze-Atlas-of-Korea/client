export interface RecommendedBarItemResponseDto {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  baseCategoryName: string | null
  openInformation: string | null
  recommendRank: number
  recommendReason: string
}

/** Controller returns `List<RecommendedBarItemResponse>` */
export type GetRecommendedBarsResponseDto = RecommendedBarItemResponseDto[]