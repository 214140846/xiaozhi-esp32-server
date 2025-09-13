/** Auto-generated hooks for admin APIs. */
import { useQuery, useMutation } from '@tanstack/react-query';
import * as Api from '../../api/admin/generated';

/** 重置密码 */
export function useAdminUsersUpdateMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params: { id: string | number }, query?: Record<string, any> | undefined, config?: any }) => Api.adminUsersUpdate(args.params as any, args.query, args.config), ...(options || {}) });
}

/** 用户删除 */
export function useAdminUsersDeleteMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params: { id: string | number }, query?: Record<string, any> | undefined, config?: any }) => Api.adminUsersDelete(args.params as any, args.query, args.config), ...(options || {}) });
}

/** 批量修改用户状态 */
export function useAdminUsersChangeStatusChangeStatusMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params: { status: string | number }, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.adminUsersChangeStatusChangeStatus(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 保存 */
export function useAdminParamsSaveMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.adminParamsSave(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 修改 */
export function useAdminParamsUpdate1Mutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.adminParamsUpdate1(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 修改字典类型 */
export function useAdminDictTypeUpdateUpdate2Mutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.adminDictTypeUpdateUpdate2(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 修改字典数据 */
export function useAdminDictDataUpdateUpdate3Mutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.adminDictDataUpdateUpdate3(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 通知python服务端更新配置 */
export function useAdminServerEmitActionEmitServerActionMutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.adminServerEmitActionEmitServerAction(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 删除 */
export function useAdminParamsDeleteDelete1Mutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.adminParamsDeleteDelete1(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 保存字典类型 */
export function useAdminDictTypeSaveSave1Mutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.adminDictTypeSaveSave1(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 删除字典类型 */
export function useAdminDictTypeDeleteDelete2Mutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: { ids?: any }, config?: any }) => Api.adminDictTypeDeleteDelete2(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 新增字典数据 */
export function useAdminDictDataSaveSave2Mutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: Record<string, any> | undefined, config?: any }) => Api.adminDictDataSaveSave2(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 删除字典数据 */
export function useAdminDictDataDeleteDelete3Mutation(options?: any) {
  return useMutation({ mutationFn: (args: { params?: Record<string, never>, data?: any, query?: { ids?: any }, config?: any }) => Api.adminDictDataDeleteDelete3(args.params as any, args.data, args.query, args.config), ...(options || {}) });
}

/** 分页查找用户 */
export function useAdminUsersPageUserQuery(params?: Record<string, never>, query?: { mobile?: any; page?: any; limit?: any }, options?: any) {
  return useQuery({ queryKey: ['AdminUsers.PageUser', params, query], queryFn: () => Api.adminUsersPageUser(params as any, query), ...(options || {}) });
}

/** 获取Ws服务端列表 */
export function useAdminServerServerListGetWsServerListQuery(params?: Record<string, never>, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['AdminServerServerList.GetWsServerList', params, query], queryFn: () => Api.adminServerServerListGetWsServerList(params as any, query), ...(options || {}) });
}

/** 信息 */
export function useAdminParamsGetQuery(params: { id: string | number }, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['AdminParams.Get', params, query], queryFn: () => Api.adminParamsGet(params as any, query), ...(options || {}) });
}

/** 分页 */
export function useAdminParamsPagePageQuery(params?: Record<string, never>, query?: { page?: any; limit?: any; orderField?: any; order?: any; paramCode?: any }, options?: any) {
  return useQuery({ queryKey: ['AdminParamsPage.Page', params, query], queryFn: () => Api.adminParamsPagePage(params as any, query), ...(options || {}) });
}

/** 获取字典类型详情 */
export function useAdminDictTypeGet1Query(params: { id: string | number }, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['AdminDictType.Get1', params, query], queryFn: () => Api.adminDictTypeGet1(params as any, query), ...(options || {}) });
}

/** 分页查询字典类型 */
export function useAdminDictTypePagePage1Query(params?: Record<string, never>, query?: { dictType?: any; dictName?: any; page?: any; limit?: any }, options?: any) {
  return useQuery({ queryKey: ['AdminDictTypePage.Page1', params, query], queryFn: () => Api.adminDictTypePagePage1(params as any, query), ...(options || {}) });
}

/** 获取字典数据详情 */
export function useAdminDictDataGet2Query(params: { id: string | number }, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['AdminDictData.Get2', params, query], queryFn: () => Api.adminDictDataGet2(params as any, query), ...(options || {}) });
}

/** 获取字典数据列表 */
export function useAdminDictDataTypeGetDictDataByTypeQuery(params: { dictType: string | number }, query?: Record<string, any> | undefined, options?: any) {
  return useQuery({ queryKey: ['AdminDictDataType.GetDictDataByType', params, query], queryFn: () => Api.adminDictDataTypeGetDictDataByType(params as any, query), ...(options || {}) });
}

/** 分页查询字典数据 */
export function useAdminDictDataPagePage2Query(params?: Record<string, never>, query?: { dictTypeId?: any; dictLabel?: any; dictValue?: any; page?: any; limit?: any }, options?: any) {
  return useQuery({ queryKey: ['AdminDictDataPage.Page2', params, query], queryFn: () => Api.adminDictDataPagePage2(params as any, query), ...(options || {}) });
}

/** 分页查找设备 */
export function useAdminDeviceAllPageDeviceQuery(params?: Record<string, never>, query?: { keywords?: any; page?: any; limit?: any }, options?: any) {
  return useQuery({ queryKey: ['AdminDeviceAll.PageDevice', params, query], queryFn: () => Api.adminDeviceAllPageDevice(params as any, query), ...(options || {}) });
}

