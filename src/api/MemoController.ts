import httpClient, { ApiCall } from '@/api/HttpClient'
import { handleUnauthorized } from '@/api/utils/unauthorized'
import type { ApiResult } from '@/api/ApiResult'
import type { MemoDto } from '@/api/responses/MemoDto'
import type { UpsertMemoRequestDto } from '@/api/requests/UpsertMemoRequestDto'

/**
 * 메모 API 컨트롤러
 * 개인 메모 조회 및 생성/수정(Upsert) 기능 제공
 */
export const MemoController = {
  /**
   * 메모 조회
   * GET /bars/{barId}/memo
   */
  async getMemo(barId: number): Promise<ApiResult<MemoDto>> {
    const res = await ApiCall<MemoDto>(() => httpClient.get(`/bars/${barId}/memo`))
    return handleUnauthorized(res)
  },

  /**
   * 메모 생성/수정 (Upsert)
   * PUT /bars/{barId}/memo
   */
  async upsertMemo(
    barId: number,
    payload: UpsertMemoRequestDto,
  ): Promise<ApiResult<MemoDto>> {
    const res = await ApiCall<MemoDto>(() =>
      httpClient.put(`/bars/${barId}/memo`, payload),
    )
    return handleUnauthorized(res)
  },
}
