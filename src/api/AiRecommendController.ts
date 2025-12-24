import { GetRecommendedBarsRequestDto } from './requests/GetRecommendedBarsRequestDto'
import { ApiResult } from '@/api/ApiResult'
import { GetRecommendedBarsResponseDto } from '@/api/responses/RecommendedBarItemResponseDto'
import httpClient, { ApiCall } from '@/api/HttpClient'

export const AIRecommendController = {
  /*
POST /ai/recommend-bars
유저 프롬프트 + 현재 위치 기준으로 AI 추천 술집 리스트를 조회한다.
(인증 필요: 세션/쿠키 기반)
  */
  async recommendBars(
    payload: GetRecommendedBarsRequestDto,
  ): Promise<ApiResult<GetRecommendedBarsResponseDto>> {
    return await ApiCall<GetRecommendedBarsResponseDto>(() =>
      httpClient.post<GetRecommendedBarsResponseDto>('/ai/recommend-bars', payload),
    )
  },
}
