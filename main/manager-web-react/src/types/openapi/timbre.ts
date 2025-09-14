import type { ApiResponse, PageData } from './common'

export interface TimbreDataDTO {
  languages: string
  name: string
  remark?: string
  referenceAudio?: string
  referenceText?: string
  sort?: number
  ttsModelId: string
  ttsVoice: string
  voiceDemo?: string
}

export type ResultVoid = ApiResponse<undefined>

export interface TimbreDetailsVO {
  id?: string
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

export type PageDataTimbreDetailsVO = PageData<TimbreDetailsVO>

export type ResultPageDataTimbreDetailsVO = ApiResponse<PageDataTimbreDetailsVO>

