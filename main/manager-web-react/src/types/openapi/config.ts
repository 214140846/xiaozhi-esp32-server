import type { ApiResponse } from './common'

export interface AgentModelsDTO {
  macAddress: string
  clientId: string
  selectedModule: Record<string, string>
}

export type ResultObject = ApiResponse<unknown>

