import { useQuery } from "@tanstack/react-query"
import { insightsApi } from "@/api/endpoints"

const INSIGHTS_KEYS = {
  streak: () => ["insights", "streak"] as const,
  moodTrend: (days: number) => ["insights", "mood-trend", days] as const,
  monthlyRecap: () => ["insights", "monthly-recap"] as const,
  onThisDay: () => ["insights", "on-this-day"] as const,
}

export function useStreak() {
  return useQuery({
    queryKey: INSIGHTS_KEYS.streak(),
    queryFn: () => insightsApi.streak().then((r) => r.data),
    staleTime: 60 * 1000,
  })
}

export function useMoodTrend(days = 90) {
  return useQuery({
    queryKey: INSIGHTS_KEYS.moodTrend(days),
    queryFn: () => insightsApi.moodTrend(days).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useMonthlyRecap() {
  return useQuery({
    queryKey: INSIGHTS_KEYS.monthlyRecap(),
    queryFn: () => insightsApi.monthlyRecap().then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
}

export function useOnThisDay() {
  return useQuery({
    queryKey: INSIGHTS_KEYS.onThisDay(),
    queryFn: () => insightsApi.onThisDay().then((r) => r.data),
    staleTime: 10 * 60 * 1000,
  })
}
