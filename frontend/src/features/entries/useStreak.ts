import { useQuery } from "@tanstack/react-query"
import { insightsApi } from "@/api/endpoints"

export const STREAK_KEY = ["entries", "streak"] as const

export function useStreak() {
  return useQuery({
    queryKey: STREAK_KEY,
    queryFn: () => insightsApi.streak().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
}
