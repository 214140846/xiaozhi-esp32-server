/** Auto-generated hooks for admin APIs. */
import { useMutation, useQuery } from "@tanstack/react-query";
import type { AxiosRequestConfig } from "axios";
import * as Api from "../../api/admin/generated";
import type {
  ResultPageDataSysDictDataVO,
  ResultPageDataSysDictTypeVO,
  ResultPageDataSysParamsDTO,
  ResultPageDataUserShowDeviceListVO,
  ResultString,
  ResultBoolean,
  ResultSysDictTypeVO,
  ResultSysParamsDTO,
  ResultListString,
  ResultVoid,
  SysDictDataDTO,
  SysDictDataVO,
  SysDictTypeDTO,
  SysParamsDTO,
} from "../../types/openapi/admin";
import type { ApiResponse } from "../../types/openapi/common";
import type { MutationOptions, QueryOptions } from "../types";

/** 重置密码 */
export function useAdminUsersUpdateMutation(
  options?: MutationOptions<
    ResultString,
    unknown,
    { params: { id: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }
  >
) {
  return useMutation<
    ResultString,
    unknown,
    { params: { id: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }
  >({ mutationFn: (args) => Api.adminUsersUpdate(args.params, args.query, args.config), ...(options || {}) });
}

/** 用户删除 */
export function useAdminUsersDeleteMutation(
  options?: MutationOptions<
    ResultVoid,
    unknown,
    { params: { id: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }
  >
) {
  return useMutation<
    ResultVoid,
    unknown,
    { params: { id: string | number }; query?: Record<string, unknown> | undefined; config?: AxiosRequestConfig }
  >({ mutationFn: (args) => Api.adminUsersDelete(args.params, args.query, args.config), ...(options || {}) });
}

/** 批量修改用户状态 */
export function useAdminUsersChangeStatusChangeStatusMutation(
  options?: MutationOptions<
    ResultVoid,
    unknown,
    {
      params: { status: string | number };
      data?: string[];
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >
) {
  return useMutation<
    ResultVoid,
    unknown,
    {
      params: { status: string | number };
      data?: string[];
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >({
    mutationFn: (args) => Api.adminUsersChangeStatusChangeStatus(args.params, args.data, args.query, args.config),
    ...(options || {}),
  });
}

/** 保存 */
export function useAdminParamsSaveMutation(
  options?: MutationOptions<
    ResultVoid,
    unknown,
    {
      params?: Record<string, never>;
      data?: SysParamsDTO;
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >
) {
  return useMutation<
    ResultVoid,
    unknown,
    {
      params?: Record<string, never>;
      data?: SysParamsDTO;
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >({ mutationFn: (args) => Api.adminParamsSave(args.params, args.data, args.query, args.config), ...(options || {}) });
}

/** 修改 */
export function useAdminParamsUpdate1Mutation(
  options?: MutationOptions<
    ResultVoid,
    unknown,
    {
      params?: Record<string, never>;
      data?: SysParamsDTO;
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >
) {
  return useMutation<
    ResultVoid,
    unknown,
    {
      params?: Record<string, never>;
      data?: SysParamsDTO;
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >({
    mutationFn: (args) => Api.adminParamsUpdate1(args.params, args.data, args.query, args.config),
    ...(options || {}),
  });
}

/** 修改字典类型 */
export function useAdminDictTypeUpdateUpdate2Mutation(
  options?: MutationOptions<
    ResultVoid,
    unknown,
    {
      params?: Record<string, never>;
      data?: SysDictTypeDTO;
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >
) {
  return useMutation<
    ResultVoid,
    unknown,
    {
      params?: Record<string, never>;
      data?: SysDictTypeDTO;
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >({
    mutationFn: (args) => Api.adminDictTypeUpdateUpdate2(args.params, args.data, args.query, args.config),
    ...(options || {}),
  });
}

/** 修改字典数据 */
export function useAdminDictDataUpdateUpdate3Mutation(
  options?: MutationOptions<
    ResultVoid,
    unknown,
    {
      params?: Record<string, never>;
      data?: SysDictDataDTO;
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >
) {
  return useMutation<
    ResultVoid,
    unknown,
    {
      params?: Record<string, never>;
      data?: SysDictDataDTO;
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >({
    mutationFn: (args) => Api.adminDictDataUpdateUpdate3(args.params, args.data, args.query, args.config),
    ...(options || {}),
  });
}

/** 通知python服务端更新配置 */
export function useAdminServerEmitActionEmitServerActionMutation(
  options?: MutationOptions<
    ResultBoolean,
    unknown,
    {
      params?: Record<string, never>;
      data?: { action?: string; targetWs?: string };
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >
) {
  // Simple admin guard using localStorage userInfo.superAdmin === 1
  const isAdmin = () => {
    try {
      const raw = localStorage.getItem("userInfo");
      if (!raw) return false;
      const user = JSON.parse(raw || "null");
      return user?.superAdmin === 1;
    } catch {
      return false;
    }
  };

  return useMutation<
    ResultBoolean,
    unknown,
    {
      params?: Record<string, never>;
      data?: { action?: string; targetWs?: string };
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >({
    mutationFn: async (args) => {
      if (!isAdmin()) {
        throw new Error("仅管理员可操作");
      }
      return Api.adminServerEmitActionEmitServerAction(
        args.params,
        args.data,
        args.query,
        args.config
      );
    },
    ...(options || {}),
  });
}

/** 删除 */
export function useAdminParamsDeleteDelete1Mutation(
  options?: MutationOptions<
    ResultVoid,
    unknown,
    {
      params?: Record<string, never>;
      data?: string[];
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >
) {
  return useMutation<
    ResultVoid,
    unknown,
    {
      params?: Record<string, never>;
      data?: string[];
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >({
    mutationFn: (args) => Api.adminParamsDeleteDelete1(args.params, args.data, args.query, args.config),
    ...(options || {}),
  });
}

/** 保存字典类型 */
export function useAdminDictTypeSaveSave1Mutation(
  options?: MutationOptions<
    ResultVoid,
    unknown,
    {
      params?: Record<string, never>;
      data?: SysDictTypeDTO;
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >
) {
  return useMutation<
    ResultVoid,
    unknown,
    {
      params?: Record<string, never>;
      data?: SysDictTypeDTO;
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >({
    mutationFn: (args) => Api.adminDictTypeSaveSave1(args.params, args.data, args.query, args.config),
    ...(options || {}),
  });
}

/** 删除字典类型 */
export function useAdminDictTypeDeleteDelete2Mutation(
  options?: MutationOptions<
    ResultVoid,
    unknown,
    { params?: Record<string, never>; data?: string[]; query?: { ids?: string[] }; config?: AxiosRequestConfig }
  >
) {
  return useMutation<
    ResultVoid,
    unknown,
    { params?: Record<string, never>; data?: string[]; query?: { ids?: string[] }; config?: AxiosRequestConfig }
  >({
    mutationFn: (args) => Api.adminDictTypeDeleteDelete2(args.params, args.data, args.query, args.config),
    ...(options || {}),
  });
}

/** 新增字典数据 */
export function useAdminDictDataSaveSave2Mutation(
  options?: MutationOptions<
    ResultVoid,
    unknown,
    {
      params?: Record<string, never>;
      data?: SysDictDataDTO;
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >
) {
  return useMutation<
    ResultVoid,
    unknown,
    {
      params?: Record<string, never>;
      data?: SysDictDataDTO;
      query?: Record<string, unknown> | undefined;
      config?: AxiosRequestConfig;
    }
  >({
    mutationFn: (args) => Api.adminDictDataSaveSave2(args.params, args.data, args.query, args.config),
    ...(options || {}),
  });
}

/** 删除字典数据 */
export function useAdminDictDataDeleteDelete3Mutation(
  options?: MutationOptions<
    ResultVoid,
    unknown,
    { params?: Record<string, never>; data?: string[]; query?: { ids?: string[] }; config?: AxiosRequestConfig }
  >
) {
  return useMutation<
    ResultVoid,
    unknown,
    { params?: Record<string, never>; data?: string[]; query?: { ids?: string[] }; config?: AxiosRequestConfig }
  >({
    mutationFn: (args) => Api.adminDictDataDeleteDelete3(args.params, args.data, args.query, args.config),
    ...(options || {}),
  });
}

/** 分页查找用户 */
export function useAdminUsersPageUserQuery(
  params?: Record<string, never>,
  query?: { mobile?: string; page?: number; limit?: number },
  options?: QueryOptions<ResultPageDataUserShowDeviceListVO>
) {
  return useQuery<ResultPageDataUserShowDeviceListVO>({
    queryKey: ["AdminUsers.PageUser", params, query],
    queryFn: () => Api.adminUsersPageUser(params, query, options?.config),
    ...(options || {}),
  });
}

/** 获取Ws服务端列表 */
export function useAdminServerServerListGetWsServerListQuery(
  params?: Record<string, never>,
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ResultListString>
) {
  return useQuery<ResultListString>({
    queryKey: ["AdminServerServerList.GetWsServerList", params, query],
    queryFn: () => Api.adminServerServerListGetWsServerList(params, query, options?.config),
    ...(options || {}),
  });
}

/** 信息 */
export function useAdminParamsGetQuery(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ResultSysParamsDTO>
) {
  return useQuery<ResultSysParamsDTO>({
    queryKey: ["AdminParams.Get", params, query],
    queryFn: () => Api.adminParamsGet(params, query, options?.config),
    ...(options || {}),
  });
}

/** 分页 */
export function useAdminParamsPagePageQuery(
  params?: Record<string, never>,
  query?: { page?: number; limit?: number; orderField?: string; order?: string; paramCode?: string },
  options?: QueryOptions<ResultPageDataSysParamsDTO>
) {
  return useQuery<ResultPageDataSysParamsDTO>({
    queryKey: ["AdminParamsPage.Page", params, query],
    queryFn: () => Api.adminParamsPagePage(params, query, options?.config),
    ...(options || {}),
  });
}

/** 获取字典类型详情 */
export function useAdminDictTypeGet1Query(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ResultSysDictTypeVO>
) {
  return useQuery<ResultSysDictTypeVO>({
    queryKey: ["AdminDictType.Get1", params, query],
    queryFn: () => Api.adminDictTypeGet1(params, query, options?.config),
    ...(options || {}),
  });
}

/** 分页查询字典类型 */
export function useAdminDictTypePagePage1Query(
  params?: Record<string, never>,
  query?: { dictType?: string; dictName?: string; page?: number; limit?: number },
  options?: QueryOptions<ResultPageDataSysDictTypeVO>
) {
  return useQuery<ResultPageDataSysDictTypeVO>({
    queryKey: ["AdminDictTypePage.Page1", params, query],
    queryFn: () => Api.adminDictTypePagePage1(params, query, options?.config),
    ...(options || {}),
  });
}

/** 获取字典数据详情 */
export function useAdminDictDataGet2Query(
  params: { id: string | number },
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<import("../../types/openapi/admin").ResultSysDictDataVO>
) {
  return useQuery<import("../../types/openapi/admin").ResultSysDictDataVO>({
    queryKey: ["AdminDictData.Get2", params, query],
    queryFn: () => Api.adminDictDataGet2(params, query, options?.config),
    ...(options || {}),
  });
}

/** 获取字典数据列表 */
export function useAdminDictDataTypeGetDictDataByTypeQuery(
  params: { dictType: string | number },
  query?: Record<string, unknown> | undefined,
  options?: QueryOptions<ApiResponse<SysDictDataVO[]>>
) {
  return useQuery<ApiResponse<SysDictDataVO[]>>({
    queryKey: ["AdminDictDataType.GetDictDataByType", params, query],
    queryFn: () => Api.adminDictDataTypeGetDictDataByType(params, query, options?.config),
    ...(options || {}),
  });
}

/** 分页查询字典数据 */
export function useAdminDictDataPagePage2Query(
  params?: Record<string, never>,
  query?: { dictTypeId?: number; dictLabel?: string; dictValue?: string; page?: number; limit?: number },
  options?: QueryOptions<ResultPageDataSysDictDataVO>
) {
  return useQuery<ResultPageDataSysDictDataVO>({
    queryKey: ["AdminDictDataPage.Page2", params, query],
    queryFn: () => Api.adminDictDataPagePage2(params, query, options?.config),
    ...(options || {}),
  });
}

/** 分页查找设备 */
export function useAdminDeviceAllPageDeviceQuery(
  params?: Record<string, never>,
  query?: { keywords?: string; page?: number; limit?: number },
  options?: QueryOptions<ResultPageDataUserShowDeviceListVO>
) {
  return useQuery<ResultPageDataUserShowDeviceListVO>({
    queryKey: ["AdminDeviceAll.PageDevice", params, query],
    queryFn: () => Api.adminDeviceAllPageDevice(params, query, options?.config),
    ...(options || {}),
  });
}
