import type { ApiResponse, PageData } from './common'

export interface JSONConfig {
  keyComparator?: unknown
  ignoreError?: boolean
  ignoreCase?: boolean
  dateFormat?: string
  ignoreNullValue?: boolean
  transientSupport?: boolean
  stripTrailingZeros?: boolean
  checkDuplicate?: boolean
  order?: boolean
}

export interface ModelConfigBodyDTO {
  modelCode?: string
  modelName?: string
  isDefault?: number
  isEnabled?: number
  configJson?: {
    raw?: Record<string, unknown>
    config?: JSONConfig
    empty?: boolean
    [k: string]: unknown
  }
  docLink?: string
  remark?: string
  sort?: number
}

export interface ModelConfigDTO extends ModelConfigBodyDTO {
  id?: string
  modelType?: string
}

export type ResultModelConfigDTO = ApiResponse<ModelConfigDTO>

export interface ModelProviderDTO {
  id: string
  modelType: string
  providerCode: string
  name: string
  fields: string
  sort: number
  updater?: number
  updateDate?: string
  creator?: number
  createDate?: string
}

export type ResultModelProviderDTO = ApiResponse<ModelProviderDTO>

export interface ModelBasicInfoDTO {
  id?: string
  modelName?: string
  type?: string
}

export type ResultListModelBasicInfoDTO = ApiResponse<ModelBasicInfoDTO[]>

export interface LlmModelBasicInfoDTO {
  id?: string
  modelName?: string
  type?: string
}

export type ResultListLlmModelBasicInfoDTO = ApiResponse<LlmModelBasicInfoDTO[]>

export type PageDataModelConfigDTO = PageData<ModelConfigDTO>

export type ResultPageDataModelConfigDTO = ApiResponse<PageDataModelConfigDTO>

