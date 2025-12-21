
export type BarSort = 'distance' | 'recommended' | 'rating' | ''; // 문서상 "" 허용 :contentReference[oaicite:1]{index=1}

export interface FindNearbyBarsRequestDto {
  latitude: number // WGS84
  longitude: number // WGS84
  radiusMeters: number // meters
  count: number // 1~50 :contentReference[oaicite:3]{index=3}

  keyword?: string // optional
  category?: string // optional
  sort?: BarSort | null // optional: distance|recommended|rating|""|null :contentReference[oaicite:4]{index=4}
}
