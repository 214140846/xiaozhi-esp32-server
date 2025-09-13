/** Auto-generated hooks for timbre APIs. */
import { useQuery, useMutation } from '@tanstack/react-query';
import * as Api from '../../api/timbre/generated';

/** 音色修改 */
export function useTtsVoiceUpdateMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params: { id: string | number }, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.ttsVoiceUpdate(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 分页查找 */
export function useTtsVoicePageQuery(params?: Record<string, never>, query?: { ttsModelId?: any; name?: any; page?: any; limit?: any }, options?: any) {
  return useQuery({ queryKey: ['TtsVoice.Page', params, query], queryFn: () => Api.ttsVoicePage(params as any, query), ...(options || {}) });
}

/** 音色保存 */
export function useTtsVoiceSaveMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.ttsVoiceSave(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 音色删除 */
export function useTtsVoiceDeleteDeleteMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.ttsVoiceDeleteDelete(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

