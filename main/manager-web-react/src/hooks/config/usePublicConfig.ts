/**
 * 获取公共配置的hook
 */
import { useQuery } from '@tanstack/react-query'
import { useConfigServerBaseGetConfigMutation } from './generatedHooks'
import { useState, useEffect } from 'react'

export interface PublicConfig {
  // 根据实际配置结构定义
  [key: string]: any
}

export function usePublicConfig() {
  const [config, setConfig] = useState<PublicConfig | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  
  const mutation = useConfigServerBaseGetConfigMutation({
    onSuccess: (data) => {
      setConfig(data?.data || null)
      setIsLoading(false)
      setError(null)
    },
    onError: (error) => {
      setError(error as Error)
      setIsLoading(false)
    }
  })

  useEffect(() => {
    // 组件挂载时自动获取配置
    mutation.mutate({ params: {}, query: {} })
  }, [])

  return {
    data: config,
    isLoading,
    error,
    refetch: () => {
      setIsLoading(true)
      mutation.mutate({ params: {}, query: {} })
    }
  }
}
