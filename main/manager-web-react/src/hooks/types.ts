import type { UseQueryOptions, UseMutationOptions, QueryKey } from '@tanstack/react-query'
import type { AxiosRequestConfig } from 'axios'

// 统一封装，给 hooks 的 options 增加 axios config，同时避免 any
export type QueryOptions<
  TData,
  TError = Error,
  TKey extends QueryKey = QueryKey
> = Omit<UseQueryOptions<TData, TError, TData, TKey>, 'queryKey' | 'queryFn'> & {
  config?: AxiosRequestConfig
}

export type MutationOptions<
  TData,
  TError = Error,
  TVariables = void,
  TContext = unknown
> = Omit<UseMutationOptions<TData, TError, TVariables, TContext>, 'mutationFn'>
