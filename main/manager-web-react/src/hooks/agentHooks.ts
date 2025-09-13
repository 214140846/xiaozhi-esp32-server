/**
  * React Query hooks generated from OpenAPI
  * Depends on functions in src/api/agentApi.ts
  */
/* eslint-disable */
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getAgentById,
  update,
  _delete,
  update_1,
  save,
  updateByDeviceId,
  save_1,
  uploadFile,
  getAudioId,
  getAgentSessions,
  getAgentChatHistory,
  getRecentlyFiftyByAgentId,
  getContentByAudioId,
  list,
  templateList,
  playAudio,
  getAgentMcpToolsList,
  getAgentMcpAccessAddress,
  getUserAgents,
  adminAgentList,
  delete_1,
} from '../api/agentApi';


/** 获取智能体详情 */
export const useGetAgentById = (path: { id: string }, options?: any) => {
  return useQuery({
    queryKey: ['getAgentById', path],
    queryFn: async () => {
      const res = await getAgentById(path);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
    ...(options || {}),
  });
};


/** 更新智能体 */
export const useUpdate = () => {
  return useMutation({
    mutationFn: async (variables: any) => {
      const args = [] as any[];
      args.push(variables?.path);
      
      args.push(variables?.body);
      const res = await update(args[0], args[1]);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
  });
};


/** 删除智能体 */
export const use_delete = () => {
  return useMutation({
    mutationFn: async (variables: any) => {
      const args = [] as any[];
      args.push(variables?.path);
      
      
      const res = await _delete(args[0]);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
  });
};


/** 更新智能体的对应声纹 */
export const useUpdate_1 = () => {
  return useMutation({
    mutationFn: async (variables: any) => {
      const args = [] as any[];
      
      
      args.push(variables?.body);
      const res = await update_1(args[0]);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
  });
};


/** 创建智能体的声纹 */
export const useSave = () => {
  return useMutation({
    mutationFn: async (variables: any) => {
      const args = [] as any[];
      
      
      args.push(variables?.body);
      const res = await save(args[0]);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
  });
};


/** 根据设备id更新智能体 */
export const useUpdateByDeviceId = () => {
  return useMutation({
    mutationFn: async (variables: any) => {
      const args = [] as any[];
      args.push(variables?.path);
      
      args.push(variables?.body);
      const res = await updateByDeviceId(args[0], args[1]);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
  });
};


/** 创建智能体 */
export const useSave_1 = () => {
  return useMutation({
    mutationFn: async (variables: any) => {
      const args = [] as any[];
      
      
      args.push(variables?.body);
      const res = await save_1(args[0]);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
  });
};


/** 小智服务聊天上报请求 */
export const useUploadFile = () => {
  return useMutation({
    mutationFn: async (variables: any) => {
      const args = [] as any[];
      
      
      args.push(variables?.body);
      const res = await uploadFile(args[0]);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
  });
};


/** 获取音频下载ID */
export const useGetAudioId = () => {
  return useMutation({
    mutationFn: async (variables: any) => {
      const args = [] as any[];
      args.push(variables?.path);
      
      
      const res = await getAudioId(args[0]);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
  });
};


/** 获取智能体会话列表 */
export const useGetAgentSessions = (path: { id: string }, query?: { page?: any; limit?: any }, options?: any) => {
  return useQuery({
    queryKey: ['getAgentSessions', path, query],
    queryFn: async () => {
      const res = await getAgentSessions(path, query);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
    ...(options || {}),
  });
};


/** 获取智能体聊天记录 */
export const useGetAgentChatHistory = (path: { id: string; sessionId: string }, options?: any) => {
  return useQuery({
    queryKey: ['getAgentChatHistory', path],
    queryFn: async () => {
      const res = await getAgentChatHistory(path);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
    ...(options || {}),
  });
};


/** 获取智能体聊天记录（用户） */
export const useGetRecentlyFiftyByAgentId = (path: { id: string }, options?: any) => {
  return useQuery({
    queryKey: ['getRecentlyFiftyByAgentId', path],
    queryFn: async () => {
      const res = await getRecentlyFiftyByAgentId(path);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
    ...(options || {}),
  });
};


/** 获取音频内容 */
export const useGetContentByAudioId = (path: { id: string }, options?: any) => {
  return useQuery({
    queryKey: ['getContentByAudioId', path],
    queryFn: async () => {
      const res = await getContentByAudioId(path);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
    ...(options || {}),
  });
};


/** 获取用户指定智能体声纹列表 */
export const useList = (path: { id: string }, options?: any) => {
  return useQuery({
    queryKey: ['list', path],
    queryFn: async () => {
      const res = await list(path);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
    ...(options || {}),
  });
};


/** 智能体模板模板列表 */
export const useTemplateList = (options?: any) => {
  return useQuery({
    queryKey: ['templateList'],
    queryFn: async () => {
      const res = await templateList();
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
    ...(options || {}),
  });
};


/** 播放音频 */
export const usePlayAudio = (path: { uuid: string }, options?: any) => {
  return useQuery({
    queryKey: ['playAudio', path],
    queryFn: async () => {
      const res = await playAudio(path);
      return res as any;
    },
    ...(options || {}),
  });
};


/** 获取智能体的Mcp工具列表 */
export const useGetAgentMcpToolsList = (path: { agentId: string }, options?: any) => {
  return useQuery({
    queryKey: ['getAgentMcpToolsList', path],
    queryFn: async () => {
      const res = await getAgentMcpToolsList(path);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
    ...(options || {}),
  });
};


/** 获取智能体的Mcp接入点地址 */
export const useGetAgentMcpAccessAddress = (path: { agentId: string }, options?: any) => {
  return useQuery({
    queryKey: ['getAgentMcpAccessAddress', path],
    queryFn: async () => {
      const res = await getAgentMcpAccessAddress(path);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
    ...(options || {}),
  });
};


/** 获取用户智能体列表 */
export const useGetUserAgents = (options?: any) => {
  return useQuery({
    queryKey: ['getUserAgents'],
    queryFn: async () => {
      const res = await getUserAgents();
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
    ...(options || {}),
  });
};


/** 智能体列表（管理员） */
export const useAdminAgentList = (query?: { page?: any; limit?: any }, options?: any) => {
  return useQuery({
    queryKey: ['adminAgentList', query],
    queryFn: async () => {
      const res = await adminAgentList(query);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
    ...(options || {}),
  });
};


/** 删除智能体对应声纹 */
export const useDelete_1 = () => {
  return useMutation({
    mutationFn: async (variables: any) => {
      const args = [] as any[];
      args.push(variables?.path);
      
      
      const res = await delete_1(args[0]);
      if ((res as any).code !== 0) { throw new Error((res as any).msg || '请求失败'); }
      return (res as any).data;
    },
  });
};

