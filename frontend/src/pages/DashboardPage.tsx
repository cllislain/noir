import { useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router-dom"
import { Layout } from "@/components/Layout"
import { AppSidebar } from "@/components/AppSidebar"
import { SidebarTagChips } from "@/components/SidebarTagChips"
import { InfiniteEntryList } from "@/features/entries/EntryList"
import { OnThisDay } from "@/features/entries/OnThisDay"
import { SearchBar } from "@/features/search/SearchBar"
import { SortControl } from "@/features/search/SortControl"
import { FilterPanel } from "@/features/search/FilterPanel"
import { useInfiniteEntries } from "@/features/entries/useEntries"
import { useSearch } from "@/features/search/useSearch"
import type { SortOrder } from "@/api/endpoints"

export function DashboardPage() {
  const navigate = useNavigate()
  const {
    filters,
    setSearch, setMood, setTags, setFavorite, setOrdering, setDateRange, reset,
  } = useSearch()

  const { page: _page, ...infiniteFilters } = filters

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useInfiniteEntries(infiniteFilters)

  const entries = useMemo(
    () => data?.pages.flatMap((p) => p.results) ?? [],
    [data]
  )
  const totalCount = data?.pages[0]?.count ?? 0

  // Heatmap date filter
  const handleDateClick = useCallback(
    (date: string | null) => {
      if (!date) {
        setDateRange(undefined, undefined)
      } else {
        const next = new Date(date)
        next.setDate(next.getDate() + 1)
        const before = next.toISOString().split("T")[0]
        setDateRange(date, before)
      }
    },
    [setDateRange]
  )

  const activeDate = filters.created_after ?? null
  const isFavActive = filters.is_favorite === true

  // Keyboard shortcut: 'n' → new entry
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName.toLowerCase()
      if (tag === "input" || tag === "textarea" || tag === "select") return
      if ((e.target as HTMLElement).isContentEditable) return
      if (e.key === "n" && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        navigate("/entries/new")
      }
    },
    [navigate]
  )

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [handleKeyDown])

  return (
    <Layout
      sidebar={
        <AppSidebar onDateClick={handleDateClick} activeDate={activeDate}>
          {/* Search + favorites — rendered in the "Search" section */}
          <div className="flex gap-2">
            <SearchBar onSearch={setSearch} />
            <button
              title="Favorites only"
              onClick={() => setFavorite(isFavActive ? undefined : true)}
              className="w-9 h-9 flex items-center justify-center rounded-lg border text-base transition-all flex-shrink-0"
              style={
                isFavActive
                  ? { backgroundColor: "var(--j-accent)", color: "var(--j-accent-text)", borderColor: "var(--j-accent)" }
                  : { backgroundColor: "var(--j-bg-elevated)", color: "var(--j-text-muted)", borderColor: "var(--j-border)" }
              }
            >
              ★
            </button>
          </div>

          {/* Tag chips */}
          <SidebarTagChips selectedTags={filters.tags} onTagClick={setTags} />

          {/* Filters */}
          <FilterPanel
            filters={filters}
            onMoodChange={setMood}
            onTagChange={setTags}
            onDateRangeChange={setDateRange}
            onReset={reset}
          />
        </AppSidebar>
      }
    >
      <div className="space-y-4">
        {/* Sort row */}
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs" style={{ color: "var(--j-text-muted)" }}>
            Press{" "}
            <kbd
              className="inline-flex items-center justify-center px-1.5 py-0.5 rounded text-xs font-mono border"
              style={{
                backgroundColor: "var(--j-bg-elevated)",
                borderColor: "var(--j-border)",
                color: "var(--j-text-secondary)",
              }}
            >
              n
            </kbd>{" "}
            to write a new entry
          </p>
          <SortControl
            value={filters.ordering as SortOrder | undefined}
            onChange={setOrdering}
          />
        </div>

        <OnThisDay />

        <InfiniteEntryList
          entries={entries}
          totalCount={totalCount}
          isLoading={isLoading}
          isFetchingNextPage={isFetchingNextPage}
          hasNextPage={hasNextPage ?? false}
          onLoadMore={fetchNextPage}
          searchQuery={filters.search}
        />
      </div>
    </Layout>
  )
}
