import { useQuery, useMutation } from '@tanstack/react-query'
import { adminListSlotsByUser, adminUpdateSlot, type TtsSlotAdminVO, type ResultList } from '@/api/admin/ttsSlots'

export function useAdminSlotsByUserQuery(
  params: { userId?: number; status?: string },
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: ['Admin.SlotsByUser', params?.userId ?? null, params?.status ?? null],
    queryFn: () => adminListSlotsByUser(params),
    select: (res: ResultList<TtsSlotAdminVO[]>) => res.data || [],
    enabled: options?.enabled !== false && params?.userId !== undefined,
  })
}

export function useAdminUpdateSlotMutation() {
  return useMutation({
    mutationFn: (args: { slotId: string; body: Partial<{ cloneLimit: number | null; quotaMode: string; ttsCallLimit: number | null; ttsTokenLimit: number | null; status: string }> }) =>
      adminUpdateSlot(args.slotId, args.body),
  })
}
