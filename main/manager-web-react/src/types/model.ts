/**
 * AI模型管理相关类型定义
 */

// 模型类型枚举
export type ModelType = 'vad' | 'asr' | 'llm' | 'vllm' | 'intent' | 'tts' | 'memory'

// 模型类型映射
export const ModelTypeMap: Record<ModelType, string> = {
  vad: 'Voice Activity Detection',
  asr: 'Automatic Speech Recognition',
  llm: 'Large Language Model',
  vllm: 'Vision Language Model',
  intent: 'Intent Recognition',
  tts: 'Text to Speech',
  memory: 'Memory'
}

// 模型类型中文映射
export const ModelTypeTextMap: Record<ModelType, string> = {
  vad: 'Voice Activity Detection Model (VAD)',
  asr: 'Automatic Speech Recognition Model (ASR)',
  llm: 'Large Language Model (LLM)',
  vllm: 'Vision Language Model (VLLM)',
  intent: 'Intent Recognition Model (Intent)',
  tts: 'Text to Speech Model (TTS)',
  memory: 'Memory Model (Memory)'
}

// 模型配置接口
export interface ModelConfig {
  id: number
  modelCode: string
  modelName: string
  isDefault: number // 0: 非默认, 1: 默认
  isEnabled: number // 0: 禁用, 1: 启用
  configJson: {
    type: string // 提供商类型
    [key: string]: any // 其他配置项
  }
  docLink?: string
  remark?: string
  sort: number
}

// 模型列表响应接口
export interface ModelListResponse {
  code: number
  msg?: string
  data: {
    list: ModelConfig[]
    total: number
  }
}

// 模型供应商接口
export interface ModelProvider {
  label: string
  value: string
}

// ====== models_OpenAPI.json 中的供应器 DTO ======
export interface ModelProviderDTO {
  id: string
  modelType: string // Memory/ASR/VAD/LLM/TTS 等
  providerCode: string // 供应器类型编码
  name: string // 供应器名称
  fields: string // 供应器字段列表(JSON字符串)
  sort: number
  updater?: number
  updateDate?: string
  creator?: number
  createDate?: string
}

// 通用分页数据
export interface PageData<T> {
  total: number
  list: T[]
}

// 模型供应器查询参数（作为 query 中的 modelProviderDTO）
export interface ProviderQueryParams {
  modelType?: string
  providerCode?: string
  name?: string
}

// 分页参数接口
export interface PaginationParams {
  page: number
  limit: number
}

// 模型查询参数接口
export interface ModelQueryParams extends PaginationParams {
  modelType: ModelType
  modelName?: string
}

// 模型新增/更新参数接口
export interface ModelFormData {
  id?: number
  modelCode: string
  modelName: string
  isDefault: boolean
  isEnabled: boolean
  configJson: Record<string, any>
  docLink?: string
  remark?: string
  sort: number
  duplicateMode?: boolean // 是否为创建副本模式
  provideCode?: string
}

// 模型操作参数接口
export interface ModelActionParams {
  modelType: ModelType
  provideCode: string
  formData: ModelFormData
  id?: number
}

// API 响应接口
export interface ApiResponse<T = any> {
  code: number
  msg?: string
  data?: T
}

// TTS音色相关接口
export interface VoiceConfig {
  id: string
  name: string
  language: string
  gender: string
}

export interface TtsModelConfig extends ModelConfig {
  voices?: VoiceConfig[]
}

// Hook返回值接口
export interface UseModelListResult {
  models: ModelConfig[]
  loading: boolean
  error: string | null
  total: number
  refresh: () => void
}

export interface UseModelActionsResult {
  createModel: (params: ModelActionParams) => Promise<ApiResponse<any>>
  updateModel: (params: ModelActionParams) => Promise<ApiResponse<any>>
  deleteModel: (id: number) => Promise<ApiResponse<any>>
  toggleModelStatus: (id: number, status: number) => Promise<ApiResponse<any>>
  setDefaultModel: (id: number) => Promise<ApiResponse<any>>
  batchDelete: (ids: number[]) => Promise<ApiResponse<any>[]>
}
