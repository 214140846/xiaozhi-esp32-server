/**
 * 模型管理API接口
 * 复刻原Vue项目的model.js API功能
 */

import apiClient from '../lib/api'
import type {
  ModelListResponse,
  ModelQueryParams,
  ModelActionParams,
  ApiResponse,
  ModelProvider,
  ModelType,
  // 新增: 基于 models_OpenAPI.json 的类型
  ModelProviderDTO,
  PageData,
  ProviderQueryParams
} from '@/types/model'

export class ModelApi {
  /**
   * 获取模型列表
   */
  static async getModelList(params: ModelQueryParams): Promise<ModelListResponse> {
    const queryParams = new URLSearchParams({
      modelType: params.modelType,
      modelName: params.modelName || '',
      page: params.page.toString(),
      limit: params.limit.toString()
    })

    const response = await apiClient.get<ModelListResponse>(`/models/list?${queryParams}`)
    return response.data
  }

  /**
   * 获取模型供应商列表
   */
  static async getModelProviders(modelType: ModelType): Promise<ModelProvider[]> {
    // 兼容 UI 的下拉选择：映射到 label/value
    // 使用 /models/provider/plugin/names 获取所有插件名称并按 modelType 过滤
    const resp = await apiClient.get<{ code: number; msg?: string; data: ModelProviderDTO[] }>(
      '/models/provider/plugin/names'
    )
    const list = resp.data?.data || []
    return list
      .filter((p) => (p.modelType || '').toLowerCase() === String(modelType).toLowerCase())
      .map((p) => ({ label: p.name, value: p.providerCode }))
  }

  /**
   * 新增模型配置
   */
  static async addModel(params: ModelActionParams): Promise<ApiResponse> {
    const { modelType, provideCode, formData } = params
    const postData = {
      modelCode: formData.modelCode,
      modelName: formData.modelName,
      isDefault: formData.isDefault ? 1 : 0,
      isEnabled: formData.isEnabled ? 1 : 0,
      configJson: formData.configJson,
      docLink: formData.docLink,
      remark: formData.remark,
      sort: formData.sort || 0
    }

    const response = await apiClient.post<ApiResponse>(`/models/${modelType}/${provideCode}`, postData)
    return response.data
  }

  /**
   * 更新模型配置
   */
  static async updateModel(params: ModelActionParams): Promise<ApiResponse> {
    const { modelType, provideCode, id, formData } = params
    const payload = {
      ...formData,
      configJson: formData.configJson,
      isDefault: formData.isDefault ? 1 : 0,
      isEnabled: formData.isEnabled ? 1 : 0
    }

    const response = await apiClient.put<ApiResponse>(`/models/${modelType}/${provideCode}/${id}`, payload)
    return response.data
  }

  /**
   * 删除模型配置
   */
  static async deleteModel(id: number): Promise<ApiResponse> {
    const response = await apiClient.delete<ApiResponse>(`/models/${id}`)
    return response.data
  }

  /**
   * 批量删除模型
   */
  static async batchDeleteModels(ids: number[]): Promise<ApiResponse[]> {
    const deletePromises = ids.map(id => this.deleteModel(id))
    return Promise.all(deletePromises)
  }

  /**
   * 更新模型状态（启用/禁用）
   */
  static async updateModelStatus(id: number, status: number): Promise<ApiResponse> {
    const response = await apiClient.put<ApiResponse>(`/models/enable/${id}/${status}`)
    return response.data
  }

  /**
   * 设置默认模型
   */
  static async setDefaultModel(id: number): Promise<ApiResponse> {
    const response = await apiClient.put<ApiResponse>(`/models/default/${id}`)
    return response.data
  }

  /**
   * 获取单个模型配置
   */
  static async getModelConfig(id: number): Promise<ApiResponse> {
    const response = await apiClient.get<ApiResponse>(`/models/${id}`)
    return response.data
  }

  /**
   * 获取模型音色列表（TTS专用）
   */
  static async getModelVoices(modelId: number, voiceName?: string): Promise<ApiResponse> {
    const queryParams = new URLSearchParams({
      voiceName: voiceName || ''
    })
    
    const response = await apiClient.get<ApiResponse>(`/models/${modelId}/voices?${queryParams}`)
    return response.data
  }

  /**
   * 获取模型名称列表
   */
  static async getModelNames(modelType: ModelType, modelName?: string): Promise<ApiResponse> {
    const response = await apiClient.get<ApiResponse>('/models/names', {
      params: { modelType, modelName }
    })
    return response.data
  }

  /**
   * 获取LLM模型代码列表
   */
  static async getLlmModelCodeList(modelName?: string): Promise<ApiResponse> {
    const response = await apiClient.get<ApiResponse>('/models/llm/names', {
      params: { modelName }
    })
    return response.data
  }

  // ====== 以下为 models_OpenAPI.json 中剩余接口 ======

  /**
   * 获取模型供应器列表（分页） GET /models/provider
   */
  static async getProviderPage(params: ProviderQueryParams & { page?: number; limit?: number }) {
    const { page = 0, limit = 10, ...modelProviderDTO } = params
    const resp = await apiClient.get<{
      code: number
      msg?: string
      data: PageData<ModelProviderDTO>
    }>('/models/provider', {
      params: { modelProviderDTO, page: String(page), limit: String(limit) }
    })
    return resp.data
  }

  /**
   * 新增模型供应器 POST /models/provider
   */
  static async addProvider(data: ModelProviderDTO) {
    const resp = await apiClient.post<{ code: number; msg?: string; data: ModelProviderDTO }>(
      '/models/provider',
      data
    )
    return resp.data
  }

  /**
   * 编辑模型供应器 PUT /models/provider
   */
  static async editProvider(data: ModelProviderDTO) {
    const resp = await apiClient.put<{ code: number; msg?: string; data: ModelProviderDTO }>(
      '/models/provider',
      data
    )
    return resp.data
  }

  /**
   * 删除模型供应器 POST /models/provider/delete
   * 文档包含 query 参数 ids 以及 body 数组，这里按 body 发送
   */
  static async deleteProviders(ids: string[]) {
    const resp = await apiClient.post<{ code: number; msg?: string; data?: any }>(
      '/models/provider/delete',
      ids,
      { params: { ids } }
    )
    return resp.data
  }

  /**
   * 获取插件名称列表 GET /models/provider/plugin/names
   */
  static async getPluginNameList() {
    const resp = await apiClient.get<{ code: number; msg?: string; data: ModelProviderDTO[] }>(
      '/models/provider/plugin/names'
    )
    return resp.data
  }
}
