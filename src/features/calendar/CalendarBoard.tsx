import { useMemo } from 'react'
import { Button, Field, Select } from '@/components/ui'
import {
  addDays,
  endOfMonth,
  formatCursorLabel,
  HOUR_END,
  HOUR_START,
  HOURS,
  minutesFromMidnight,
  sameDay,
  shiftCursor,
  startOfDay,
  startOfMonth,
  startOfWeek,
  type CalendarViewMode,
} from './calendarDates'
import './calendar-board.css'

export type CalendarBoardEvent = {
  occurrenceKey: string
  id: string
  title: string
  startsAt: string
  endsAt: string
  allDay: boolean
  locationText?: string | null
  meta?: string | null
}

type Props = {
  events: CalendarBoardEvent[]
  view: CalendarViewMode
  cursor: Date
  onCursorChange: (next: Date) => void
  onViewChange: (view: CalendarViewMode) => void
  onEventClick: (event: CalendarBoardEvent) => void
  loading?: boolean
  /** Compact height for board embeds */
  compact?: boolean
}

function eventsOnDay(events: CalendarBoardEvent[], day: Date) {
  return events
    .filter((event) => sameDay(new Date(event.startsAt), day))
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}

function timedLayout(event: CalendarBoardEvent) {
  const start = new Date(event.startsAt)
  const end = new Date(event.endsAt)
  if (event.allDay) {
    return { topPct: 0, heightPct: 8, allDay: true as const }
  }
  const dayStartMins = HOUR_START * 60
  const spanMins = (HOUR_END - HOUR_START) * 60
  const startMins = Math.max(minutesFromMidnight(start), dayStartMins)
  const endMins = Math.min(Math.max(minutesFromMidnight(end), startMins + 30), HOUR_END * 60)
  const topPct = ((startMins - dayStartMins) / spanMins) * 100
  const heightPct = Math.max(((endMins - startMins) / spanMins) * 100, 4)
  return { topPct, heightPct, allDay: false as const }
}

export function CalendarBoard({
  events,
  view,
  cursor,
  onCursorChange,
  onViewChange,
  onEventClick,
  loading,
  compact,
}: Props) {
  const today = startOfDay(new Date())

  const monthCells = useMemo(() => {
    const first = startOfMonth(cursor)
    const startWeekday = first.getDay()
    const daysInMonth = endOfMonth(cursor).getDate()
    const cells: Array<{ date: Date | null }> = []
    for (let i = 0; i < startWeekday; i += 1) cells.push({ date: null })
    for (let day = 1; day <= daysInMonth; day += 1) {
      cells.push({ date: new Date(cursor.getFullYear(), cursor.getMonth(), day) })
    }
    return cells
  }, [cursor])

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor)
    return Array.from({ length: 7 }, (_, i) => addDays(start, i))
  }, [cursor])

  const day = startOfDay(cursor)

  return (
    <div className={`cal-board${compact ? ' cal-board--compact' : ''}`}>
      <div className="cal-board__toolbar">
        <Field id="cal-board-view" label="View">
          <Select
            id="cal-board-view"
            value={view}
            onChange={(e) => onViewChange(e.target.value as CalendarViewMode)}
          >
            <option value="month">Month</option>
            <option value="week">Week</option>
            <option value="day">Day</option>
          </Select>
        </Field>
        <div className="cal-board__nav">
          <Button
            type="button"
            variant="secondary"
            onClick={() => onCursorChange(shiftCursor(view, cursor, -1))}
          >
            Previous
          </Button>
          <strong className="cal-board__label">{formatCursorLabel(view, cursor)}</strong>
          <Button
            type="button"
            variant="secondary"
            onClick={() => onCursorChange(shiftCursor(view, cursor, 1))}
          >
            Next
          </Button>
          <Button type="button" variant="secondary" onClick={() => onCursorChange(today)}>
            Today
          </Button>
        </div>
      </div>

      {loading ? <p className="field__hint">Loading events…</p> : null}

      {view === 'month' ? (
        <div className="cal-board__month" role="grid" aria-label="Month calendar">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((label) => (
            <div key={label} className="cal-board__dow" role="columnheader">
              {label}
            </div>
          ))}
          {monthCells.map((cell, index) => {
            const dayEvents = cell.date ? eventsOnDay(events, cell.date) : []
            const isToday = cell.date ? sameDay(cell.date, today) : false
            return (
              <div
                key={index}
                className={[
                  'cal-board__month-cell',
                  !cell.date ? 'cal-board__month-cell--empty' : '',
                  isToday ? 'cal-board__month-cell--today' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                role="gridcell"
              >
                {cell.date ? (
                  <>
                    <button
                      type="button"
                      className="cal-board__daynum"
                      onClick={() => {
                        onCursorChange(cell.date!)
                        onViewChange('day')
                      }}
                      title="Open day view"
                    >
                      {cell.date.getDate()}
                    </button>
                    {dayEvents.slice(0, compact ? 2 : 4).map((event) => (
                      <button
                        key={event.occurrenceKey}
                        type="button"
                        className="cal-board__chip"
                        title={event.meta ? `${event.title} · ${event.meta}` : event.title}
                        onClick={() => onEventClick(event)}
                      >
                        {!event.allDay
                          ? `${new Date(event.startsAt).toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })} `
                          : ''}
                        {event.title}
                      </button>
                    ))}
                    {dayEvents.length > (compact ? 2 : 4) ? (
                      <div className="field__hint">
                        +{dayEvents.length - (compact ? 2 : 4)} more
                      </div>
                    ) : null}
                  </>
                ) : null}
              </div>
            )
          })}
        </div>
      ) : null}

      {view === 'week' ? (
        <div className="cal-board__week">
          <div className="cal-board__week-head">
            <div className="cal-board__gutter" />
            {weekDays.map((d) => (
              <button
                key={d.toISOString()}
                type="button"
                className={`cal-board__week-dayhead${sameDay(d, today) ? ' cal-board__week-dayhead--today' : ''}`}
                onClick={() => {
                  onCursorChange(d)
                  onViewChange('day')
                }}
              >
                <span>{d.toLocaleDateString(undefined, { weekday: 'short' })}</span>
                <strong>{d.getDate()}</strong>
              </button>
            ))}
          </div>
          <div className="cal-board__allday-row">
            <div className="cal-board__gutter">All day</div>
            {weekDays.map((d) => (
              <div key={`all-${d.toISOString()}`} className="cal-board__allday-cell">
                {eventsOnDay(events, d)
                  .filter((e) => e.allDay)
                  .map((event) => (
                    <button
                      key={event.occurrenceKey}
                      type="button"
                      className="cal-board__chip"
                      onClick={() => onEventClick(event)}
                    >
                      {event.title}
                    </button>
                  ))}
              </div>
            ))}
          </div>
          <div className="cal-board__week-body">
            <div className="cal-board__hours">
              {HOURS.map((hour) => (
                <div key={hour} className="cal-board__hour">
                  {hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
                </div>
              ))}
            </div>
            {weekDays.map((d) => (
              <div key={`col-${d.toISOString()}`} className="cal-board__week-col">
                {HOURS.map((hour) => (
                  <div key={hour} className="cal-board__slot" />
                ))}
                {eventsOnDay(events, d)
                  .filter((e) => !e.allDay)
                  .map((event) => {
                    const layout = timedLayout(event)
                    return (
                      <button
                        key={event.occurrenceKey}
                        type="button"
                        className="cal-board__block"
                        style={{ top: `${layout.topPct}%`, height: `${layout.heightPct}%` }}
                        onClick={() => onEventClick(event)}
                        title={event.title}
                      >
                        {event.title}
                      </button>
                    )
                  })}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {view === 'day' ? (
        <div className="cal-board__day">
          <div className="cal-board__allday-row cal-board__allday-row--day">
            <div className="cal-board__gutter">All day</div>
            <div className="cal-board__allday-cell">
              {eventsOnDay(events, day)
                .filter((e) => e.allDay)
                .map((event) => (
                  <button
                    key={event.occurrenceKey}
                    type="button"
                    className="cal-board__chip"
                    onClick={() => onEventClick(event)}
                  >
                    {event.title}
                  </button>
                ))}
            </div>
          </div>
          <div className="cal-board__day-body">
            <div className="cal-board__hours">
              {HOURS.map((hour) => (
                <div key={hour} className="cal-board__hour">
                  {hour === 12 ? '12pm' : hour > 12 ? `${hour - 12}pm` : `${hour}am`}
                </div>
              ))}
            </div>
            <div className="cal-board__day-col">
              {HOURS.map((hour) => (
                <div key={hour} className="cal-board__slot" />
              ))}
              {eventsOnDay(events, day)
                .filter((e) => !e.allDay)
                .map((event) => {
                  const layout = timedLayout(event)
                  return (
                    <button
                      key={event.occurrenceKey}
                      type="button"
                      className="cal-board__block"
                      style={{ top: `${layout.topPct}%`, height: `${layout.heightPct}%` }}
                      onClick={() => onEventClick(event)}
                    >
                      <strong>{event.title}</strong>
                      {event.locationText ? <span>{event.locationText}</span> : null}
                    </button>
                  )
                })}
            </div>
          </div>
          {eventsOnDay(events, day).length === 0 && !loading ? (
            <p className="field__hint">No events this day.</p>
          ) : null}
        </div>
      ) : null}
    </div>
  )
}
