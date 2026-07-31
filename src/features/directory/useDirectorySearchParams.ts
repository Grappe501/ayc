import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

export type DirectoryView = 'people' | 'teams' | 'locations'

export function useDirectorySearchParams() {
  const [params, setParams] = useSearchParams()

  const view = (params.get('view') as DirectoryView | null) ?? 'people'
  const q = params.get('q') ?? ''
  const locationType = params.get('locationType') ?? ''
  const location = params.get('location') ?? ''
  const team = params.get('team') ?? ''
  const position = params.get('position') ?? ''
  const status = params.get('status') ?? 'ACTIVE'
  const sort = params.get('sort') ?? 'name'

  const setView = useCallback(
    (next: DirectoryView) => {
      const nextParams = new URLSearchParams(params)
      if (next === 'people') nextParams.delete('view')
      else nextParams.set('view', next)
      setParams(nextParams, { replace: true })
    },
    [params, setParams],
  )

  const update = useCallback(
    (patch: Record<string, string | null>) => {
      const nextParams = new URLSearchParams(params)
      for (const [key, value] of Object.entries(patch)) {
        if (!value) nextParams.delete(key)
        else nextParams.set(key, value)
      }
      // Keep people as default view when applying people filters
      if (!patch.view && nextParams.get('view') !== 'teams' && nextParams.get('view') !== 'locations') {
        nextParams.delete('view')
      }
      setParams(nextParams, { replace: true })
    },
    [params, setParams],
  )

  const clearFilters = useCallback(() => {
    const nextParams = new URLSearchParams()
    const currentView = params.get('view')
    if (currentView === 'teams' || currentView === 'locations') {
      nextParams.set('view', currentView)
    }
    setParams(nextParams, { replace: true })
  }, [params, setParams])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (q) count += 1
    if (locationType) count += 1
    if (location) count += 1
    if (team) count += 1
    if (position) count += 1
    if (status && status !== 'ACTIVE') count += 1
    if (sort && sort !== 'name') count += 1
    return count
  }, [q, locationType, location, team, position, status, sort])

  const peopleQuery = useMemo(() => {
    const qs = new URLSearchParams()
    if (q) qs.set('q', q)
    if (locationType) qs.set('locationType', locationType)
    if (location) qs.set('location', location)
    if (team) qs.set('team', team)
    if (position) qs.set('position', position)
    if (status) qs.set('status', status)
    if (sort) qs.set('sort', sort)
    return qs
  }, [q, locationType, location, team, position, status, sort])

  return {
    view: view === 'teams' || view === 'locations' ? view : 'people',
    q,
    locationType,
    location,
    team,
    position,
    status,
    sort,
    setView,
    update,
    clearFilters,
    activeFilterCount,
    peopleQuery,
  }
}
