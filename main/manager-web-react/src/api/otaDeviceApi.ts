/**
 * OTA Device API (from api-docs/ota_OpenAPI.json)
 */
import apiClient from '@/lib/api'
import type { DeviceReportReqDTO, OtaHeaders } from '@/types/ota-device'

// Helper to build required headers
const buildHeaders = ({ deviceId, clientId }: OtaHeaders) => {
  const headers: Record<string, string> = { 'Device-Id': deviceId }
  if (clientId) headers['Client-Id'] = clientId
  return headers
}

export const otaDeviceApi = {
  /**
   * POST /ota/activate
   * 设备快速检查激活状态
   * Response: plain string
   */
  activateDevice: async (headers: OtaHeaders): Promise<string> => {
    const resp = await apiClient.post<string>(`/ota/activate`, null, {
      headers: buildHeaders(headers),
    })
    return resp.data
  },

  /**
   * POST /ota/
   * OTA版本和设备激活状态检查
   * Request body: DeviceReportReqDTO
   * Response: plain string
   */
  checkOTAVersion: async (
    headers: OtaHeaders,
    data: DeviceReportReqDTO,
  ): Promise<string> => {
    const resp = await apiClient.post<string>(`/ota/`, data, {
      headers: buildHeaders(headers),
    })
    return resp.data
  },
}

export default otaDeviceApi

