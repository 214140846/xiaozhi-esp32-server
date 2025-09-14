import type { ApiResponse, PageData } from './common'

// Basic DTOs
export interface FunctionInfo {
  pluginId?: string
  paramInfo?: Record<string, unknown>
}

export interface AgentUpdateDTO {
  agentCode?: string
  agentName?: string
  asrModelId?: string
  vadModelId?: string
  llmModelId?: string
  vllmModelId?: string
  ttsModelId?: string
  ttsVoiceId?: string
  memModelId?: string
  intentModelId?: string
  functions?: FunctionInfo[]
  systemPrompt?: string
  summaryMemory?: string
  chatHistoryConf?: number
  langCode?: string
  language?: string
  sort?: number
}

export interface AgentCreateDTO extends AgentUpdateDTO {}

export interface AgentMemoryDTO {
  macAddress?: string
  memory?: Record<string, unknown>
}

export interface AgentVoicePrintSaveDTO {
  agentId?: string
  audioId?: string
  sourceName?: string
  introduce?: string
}

export interface AgentVoicePrintUpdateDTO extends AgentVoicePrintSaveDTO {
  id?: string
}

export interface AgentChatHistoryReportDTO {
  agentId?: string
  sessionId?: string
  type?: string
  text?: string
  audioId?: string
  extra?: Record<string, unknown>
}

// VO and list DTOs
export interface AgentInfoVO extends AgentUpdateDTO {
  id?: string
}

export interface AgentDTO extends AgentUpdateDTO {
  id?: string
}

export interface AgentChatSessionDTO {
  id?: string
  agentId?: string
  sessionName?: string
  lastMessageAt?: string
}

export interface AgentChatHistoryVO {
  id?: string
  agentId?: string
  sessionId?: string
  role?: string
  contentType?: string
  text?: string
  audioId?: string
  createDate?: string
}

export interface AgentChatHistoryUserVO {
  id?: string
  agentId?: string
  role?: string
  text?: string
  audioId?: string
  createDate?: string
}

export interface AgentVoicePrintVO {
  id?: string
  audioId?: string
  sourceName?: string
  introduce?: string
  createDate?: string
}

// Page data wrappers
export type PageDataAgentEntity = PageData<AgentDTO>
export type PageDataAgentChatSessionDTO = PageData<AgentChatSessionDTO>

// Results
export type ResultVoid = ApiResponse<undefined>
export type ResultString = ApiResponse<string>
export type ResultBoolean = ApiResponse<boolean>
export type ResultAgentInfoVO = ApiResponse<AgentInfoVO>
export type ResultPageDataAgentEntity = ApiResponse<PageDataAgentEntity>
export type ResultPageDataAgentChatSessionDTO = ApiResponse<PageDataAgentChatSessionDTO>
export type ResultListAgentChatHistoryVO = ApiResponse<AgentChatHistoryVO[]>
export type ResultListAgentChatHistoryUserVO = ApiResponse<AgentChatHistoryUserVO[]>
export type ResultListAgentVoicePrintVO = ApiResponse<AgentVoicePrintVO[]>
export type ResultListAgentDTO = ApiResponse<AgentDTO[]>

