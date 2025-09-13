/**
 * TTS 音色管理相关类型（基于 api-docs/timbre_OpenAPI.json）
 */

// 通用响应结构（code/msg/data）
export interface ApiResponse<T = any> {
  code: number
  msg?: string
  data?: T
}

// 分页数据
export interface PageData<T> {
  total: number
  list: T[]
}

// 音色新增/修改 DTO
export interface TimbreDataDTO {
  // 语言（必填）
  languages: string
  // 音色名称（必填）
  name: string
  // 备注
  remark?: string
  // 参考音频路径
  referenceAudio?: string
  // 参考文本
  referenceText?: string
  // 排序（>=0）
  sort?: number
  // 对应 TTS 模型主键（必填）
  ttsModelId: string
  // 音色编码（必填）
  ttsVoice: string
  // 音频播放地址
  voiceDemo?: string
}

// 音色详情 VO
export interface TimbreDetailsVO {
  id: string
  languages?: string
  name?: string
  remark?: string
  referenceAudio?: string
  referenceText?: string
  sort?: number
  ttsModelId?: string
  ttsVoice?: string
  voiceDemo?: string
}

// 列表查询参数（分页）
export interface TimbreListQuery {
  // 对应 TTS 模型主键（必填）
  ttsModelId: string
  // 音色名称
  name?: string
  // 当前页码，从 1 开始（必填）
  page: number
  // 每页大小（必填）
  limit: number
}

export type TimbreId = string

