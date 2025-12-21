import { LoginRequestDto } from '@/api/requests/LoginRequestDto'
import httpClient, { ApiCall } from '@/api/HttpClient'
import { SignUpRequestDto } from '@/api/requests/SignUpRequestDto'
import { ApiResult } from '@/api/ApiResult'
import { FindNearbyBarsRequestDto } from '@/api/requests/FindNearbyBarsRequestDto'
import { FindNearbyBarsResponseDto } from '@/api/responses/BarListItemDto'
import { GetBarResponseDto } from '@/api/responses/GetBarResponseDto'

export const BarController = {
  /*
POST /api/bars/nearby
현재 위치(위도/경도) 기준으로 반경 내 술집 리스트를 조회한다.
  */
  async nearby(payload: FindNearbyBarsRequestDto): Promise<ApiResult<FindNearbyBarsResponseDto>> {
    return await ApiCall<FindNearbyBarsResponseDto>(() =>
      httpClient.post<FindNearbyBarsResponseDto>('/bars/nearby', payload),
    )
  },

  /*
GET /bars/{barId}
술집 ID로 상세 정보를 조회한다.
  */
  async findBarById(payload: number): Promise<ApiResult<GetBarResponseDto>> {
    return await ApiCall<GetBarResponseDto>(() =>
      httpClient.get<GetBarResponseDto>(`/bars/${payload}`),
    )
  },
}
