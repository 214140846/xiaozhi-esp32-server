/**
 * 智能体相关类型定义
 */

export interface Agent {
  /** 智能体ID */
  id: string;
  /** 智能体ID（兼容字段） */
  agentId: string;
  /** 智能体名称 */
  agentName: string;
  /** 智能体描述 */
  description?: string;
  /** 智能体头像/图标 */
  avatar?: string;
  /** 智能体状态 */
  status?: 'online' | 'offline' | 'busy';
  /** 创建时间 */
  createdAt?: string;
  /** 更新时间 */
  updatedAt?: string;
  /** 额外属性 */
  [key: string]: any;
}

export interface AgentListResponse {
  /** 状态码 */
  code: number;
  /** 响应消息 */
  msg: string;
  /** 智能体列表数据 */
  data: Agent[];
}

export interface AddAgentRequest {
  /** 智能体名称 */
  agentName: string;
  /** 智能体描述 */
  description?: string;
  /** 其他配置 */
  [key: string]: any;
}

export interface AddAgentResponse {
  /** 状态码 */
  code: number;
  /** 响应消息 */
  msg: string;
  /** 新创建的智能体数据 */
  data?: Agent;
}

export interface DeleteAgentResponse {
  /** 状态码 */
  code: number;
  /** 响应消息 */
  msg: string;
}

/**
 * 聊天记录相关类型
 */
export interface ChatMessage {
  /** 消息ID */
  id: string;
  /** 发送者类型 */
  sender: 'user' | 'agent';
  /** 消息内容 */
  content: string;
  /** 发送时间 */
  timestamp: string;
  /** 消息状态 */
  status?: 'sending' | 'sent' | 'failed';
}

export interface ChatHistoryResponse {
  /** 状态码 */
  code: number;
  /** 响应消息 */
  msg: string;
  /** 聊天记录数据 */
  data: ChatMessage[];
}