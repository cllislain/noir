import { useQuery } from "@tanstack/react-query"
import { insightsApi } from "@/api/endpoints"

export function useHeatmap(year: number, month: number) {
  return useQuery({
    queryKey: ["insights", "heatmap", year, month],
    queryFn: () => insightsApi.heatmap(year, month).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  })
}
