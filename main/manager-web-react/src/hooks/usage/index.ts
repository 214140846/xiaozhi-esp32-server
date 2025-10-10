/**
 * TTS用量相关React Query Hooks
 */
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getMyUsageStatistics,
  getAdminUsageStatistics,
  getStatisticsByUser,
  getMyUsageDetails,
  getAdminUsageDetails,
  exportMyUsage,
  exportAdminUsage,
} from '../../api/usage';

export function useMyUsageStatisticsQuery(
  params?: { period?: string; start?: string; end?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({ queryKey: ['usage','my-statistics', params], queryFn: () => getMyUsageStatistics(params), keepPreviousData: true, refetchOnWindowFocus: false, ...(options || {}) });
}

export function useAdminUsageStatisticsQuery(
  params?: { userId?: number | string; period?: string; start?: string; end?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({ queryKey: ['usage','admin-statistics', params], queryFn: () => getAdminUsageStatistics(params), keepPreviousData: true, refetchOnWindowFocus: false, ...(options || {}) });
}

export function useStatisticsByUserQuery(
  params?: { period?: string; start?: string; end?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({ queryKey: ['usage','statistics-by-user', params], queryFn: () => getStatisticsByUser(params), keepPreviousData: true, refetchOnWindowFocus: false, ...(options || {}) });
}

export function useMyUsageDetailsQuery(
  params?: { endpoint?: string; start?: string; end?: string; limit?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({ queryKey: ['usage','my-details', params], queryFn: () => getMyUsageDetails(params), keepPreviousData: true, refetchOnWindowFocus: false, ...(options || {}) });
}

export function useAdminUsageDetailsQuery(
  params?: { userId?: number | string; endpoint?: string; start?: string; end?: string; limit?: number },
  options?: { enabled?: boolean }
) {
  return useQuery({ queryKey: ['usage','admin-details', params], queryFn: () => getAdminUsageDetails(params), keepPreviousData: true, refetchOnWindowFocus: false, ...(options || {}) });
}

export function useExportMyUsageMutation() {
  return useMutation({ mutationFn: (params?: { endpoint?: string; start?: string; end?: string }) => exportMyUsage(params) });
}

export function useExportAdminUsageMutation() {
  return useMutation({ mutationFn: (params?: { userId?: number; endpoint?: string; start?: string; end?: string }) => exportAdminUsage(params) });
}
