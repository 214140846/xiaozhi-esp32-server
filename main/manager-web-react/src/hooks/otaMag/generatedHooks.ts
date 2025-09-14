/** Auto-generated hooks for OTAMagController APIs. */
import { useQuery, useMutation } from '@tanstack/react-query'
import * as Api from '../../api/otaMag/generated'
import type { MutationOptions, QueryOptions } from '../types'
import type { AxiosRequestConfig } from 'axios'
import type { ResultVoid, ResultString, ResultOtaEntity, ResultPageOtaEntity } from '../../types/openapi/otaMag'

/** 分页查询 OTA 固件信息 */
export function useOtaMagPageQuery(
  params: { page: number; limit: number } & Record<string, unknown>,
  options?: QueryOptions<ResultPageOtaEntity>
): ReturnType<typeof useQuery<ResultPageOtaEntity>> {
  return useQuery<ResultPageOtaEntity>({
    queryKey: ['OTAMag.Page', params],
    queryFn: () => Api.otaMagPage(params, options?.config),
    ...(options || {}),
  })
}

/** 获取单个 OTA 固件信息 */
export function useOtaMagGetQuery(
  params: { id: string | number },
  options?: QueryOptions<ResultOtaEntity>
): ReturnType<typeof useQuery<ResultOtaEntity>> {
  return useQuery<ResultOtaEntity>({
    queryKey: ['OTAMag.Get', params],
    queryFn: () => Api.otaMagGet(params, options?.config),
    ...(options || {}),
  })
}

/** 新增 OTA 固件信息 */
export function useOtaMagSaveMutation(
  options?: MutationOptions<ResultVoid, unknown, { data: Parameters<typeof Api.otaMagSave>[0]; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { data: Parameters<typeof Api.otaMagSave>[0]; config?: AxiosRequestConfig }>(
    {
      mutationFn: (args) => Api.otaMagSave(args.data, args.config),
      ...(options || {}),
    }
  )
}

/** 修改 OTA 固件信息 */
export function useOtaMagUpdateMutation(
  options?: MutationOptions<ResultVoid, unknown, { params: { id: string | number }; data: Parameters<typeof Api.otaMagUpdate>[1]; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { params: { id: string | number }; data: Parameters<typeof Api.otaMagUpdate>[1]; config?: AxiosRequestConfig }>(
    {
      mutationFn: (args) => Api.otaMagUpdate(args.params, args.data, args.config),
      ...(options || {}),
    }
  )
}

/** 删除 OTA 固件信息（支持批量） */
export function useOtaMagDeleteMutation(
  options?: MutationOptions<ResultVoid, unknown, { params: { id: string | number }; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultVoid, unknown, { params: { id: string | number }; config?: AxiosRequestConfig }>(
    {
      mutationFn: (args) => Api.otaMagDelete(args.params, args.config),
      ...(options || {}),
    }
  )
}

/** 上传固件文件 */
export function useOtaMagUploadMutation(
  options?: MutationOptions<ResultString, unknown, { file: File; config?: AxiosRequestConfig }>
) {
  return useMutation<ResultString, unknown, { file: File; config?: AxiosRequestConfig }>(
    {
      mutationFn: (args) => Api.otaMagUpload(args.file, args.config),
      ...(options || {}),
    }
  )
}

