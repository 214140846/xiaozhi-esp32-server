import type { ModelConfigDTO, ModelConfigBodyDTO } from './openapi/models'

export type ModelConfig = ModelConfigDTO
export type ModelFormData = ModelConfigBodyDTO

export type ModelType =
  | 'vad'
  | 'asr'
  | 'llm'
  | 'vllm'
  | 'intent'
  | 'tts'
  | 'memory'

export const ModelTypeTextMap: Record<ModelType, string> = {
  vad: 'Voice Activity Detection',
  asr: 'Speech Recognition',
  llm: 'Large Language Model',
  vllm: 'Vision Language Model',
  intent: 'Intent Recognition',
  tts: 'Text to Speech',
  memory: 'Memory',
}

