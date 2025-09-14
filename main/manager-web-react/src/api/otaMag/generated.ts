/** Auto-generated style client for OTAMagController. */
import { apiClient } from '../../lib/api'
import type { AxiosRequestConfig } from 'axios'
import type { ResultVoid, ResultString, ResultPageOtaEntity, ResultOtaEntity } from '../../types/openapi/otaMag'

/** 分页查询 OTA 固件信息 */
export async function otaMagPage(
  params: { page: number; limit: number } & Record<string, unknown>,
  config?: AxiosRequestConfig
): Promise<ResultPageOtaEntity> {
  const url = `/otaMag`
  const existingParams = (config?.params ?? {}) as Record<string, unknown>
  const requestConfig: AxiosRequestConfig = { ...(config ?? {}), params: { ...existingParams, ...params } }
  const res = await apiClient.get<ResultPageOtaEntity>(url, requestConfig)
  return res.data
}

/** 获取单个 OTA 固件信息 */
export async function otaMagGet(
  params: { id: string | number },
  config?: AxiosRequestConfig
): Promise<ResultOtaEntity> {
  const url = `/otaMag/${params.id}`
  const res = await apiClient.get<ResultOtaEntity>(url, config)
  return res.data
}

/** 新增 OTA 固件信息 */
export async function otaMagSave(
  data: {
    firmwareName: string
    type: string
    version: string
    size?: number
    remark?: string
    firmwarePath: string
    sort?: number
  },
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/otaMag`
  const res = await apiClient.post<ResultVoid>(url, data, config)
  return res.data
}

/** 修改 OTA 固件信息 */
export async function otaMagUpdate(
  params: { id: string | number },
  data: Partial<{
    firmwareName: string
    type: string
    version: string
    size?: number
    remark?: string
    firmwarePath: string
    sort?: number
  }>,
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/otaMag/${params.id}`
  const res = await apiClient.put<ResultVoid>(url, data, config)
  return res.data
}

/** 删除 OTA 固件信息（支持批量，逗号分隔） */
export async function otaMagDelete(
  params: { id: string | number },
  config?: AxiosRequestConfig
): Promise<ResultVoid> {
  const url = `/otaMag/${params.id}`
  const res = await apiClient.delete<ResultVoid>(url, config)
  return res.data
}

/** 上传固件文件，返回后端保存的文件路径 */
export async function otaMagUpload(
  file: File,
  config?: AxiosRequestConfig
): Promise<ResultString> {
  const url = `/otaMag/upload`
  const form = new FormData()
  form.append('file', file)
  const res = await apiClient.post<ResultString>(url, form, {
    ...(config ?? {}),
    headers: { ...(config?.headers ?? {}), 'Content-Type': 'multipart/form-data' },
  })
  return res.data
}

