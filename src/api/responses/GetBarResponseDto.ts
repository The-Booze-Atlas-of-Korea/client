export interface GetBarResponseDto {
  id: number
  name: string
  address: string
  latitude: number
  longitude: number
  baseCategoryName: string

  menus: string[] // 없으면 [] :contentReference[oaicite:8]{index=8}
  categories: string[] // 없으면 [] :contentReference[oaicite:9]{index=9}

  openInformation: string

  createdAt: string
  updatedAt: string
  deletedAt: string | null
}
