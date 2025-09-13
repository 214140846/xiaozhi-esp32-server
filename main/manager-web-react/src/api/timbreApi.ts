/**
 * 音色管理 API（基于 api-docs/timbre_OpenAPI.json）
 */
import apiClient from '@/lib/api'
import type {
  ApiResponse,
  PageData,
  TimbreDataDTO,
  TimbreDetailsVO,
  TimbreListQuery,
  TimbreId,
} from '@/types/timbre'

export const TIMBRE_QUERY_KEY = 'timbreList'

export const timbreApi = {
  /**
   * 分页查找音色 GET /ttsVoice
   */
  getTimbreList: async (
    params: TimbreListQuery
  ): Promise<ApiResponse<PageData<TimbreDetailsVO>>> => {
    const response = await apiClient.get<ApiResponse<PageData<TimbreDetailsVO>>>('/ttsVoice', {
      params,
    })
    return response.data
  },

  /**
   * 音色保存 POST /ttsVoice
   */
  createTimbre: async (data: TimbreDataDTO): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/ttsVoice', data)
    return response.data
  },

  /**
   * 音色修改 PUT /ttsVoice/{id}
   */
  updateTimbre: async (id: TimbreId, data: TimbreDataDTO): Promise<ApiResponse<void>> => {
    const response = await apiClient.put<ApiResponse<void>>(`/ttsVoice/${id}`, data)
    return response.data
  },

  /**
   * 音色删除（批量） POST /ttsVoice/delete
   * 按 OpenAPI，body 为 string[]（id 列表）
   */
  deleteTimbres: async (ids: TimbreId[]): Promise<ApiResponse<void>> => {
    const response = await apiClient.post<ApiResponse<void>>('/ttsVoice/delete', ids)
    return response.data
  },
}

export default timbreApi

