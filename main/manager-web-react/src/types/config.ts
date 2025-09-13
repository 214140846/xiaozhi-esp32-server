/**
 * 配置相关类型定义（基于 api-docs/config_OpenAPI.json）
 */

// 统一使用模型模块里的 ApiResponse 结构：{ code, msg, data }
import type { ApiResponse } from '@/types/model'

// 获取智能体模型配置请求体
export interface AgentModelsDTO {
  macAddress: string
  clientId: string
  selectedModule: Record<string, string>
}

// 服务端基础配置返回的数据结构（未在文档中细化，保持为 unknown）
export type ServerBaseConfig = unknown

// 导出复用的响应类型
export type ConfigResponse<T = any> = ApiResponse<T>

