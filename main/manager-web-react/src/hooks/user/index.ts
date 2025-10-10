import { useQuery } from '@tanstack/react-query';
import { authAPI } from '../../lib/api';

export function useUserDetailQuery() {
  return useQuery({ queryKey: ['user','info'], queryFn: () => authAPI.getUserInfo(), staleTime: 60_000 });
}

