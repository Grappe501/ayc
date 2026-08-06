import { Navigate, Route, Routes } from 'react-router-dom'
import { PresenterDrillPage, PresenterHub, PresenterSlidePage } from './PresenterBoard'
import { Shell } from './Shell'
import {
  Calendar,
  Close,
  Elections,
  Events,
  Join,
  Operation,
  StrikeTeams,
  Teams,
  Tollette,
  Vision,
  Welcome,
  Why,
} from './pages'
import { MEETING_BASE } from './paths'
import './styles.css'

/**
 * Standalone presentation shell (no workbench chrome).
 * Mounted at /leadership-meeting/* on arkansasyouth.
 */
export function LeadershipMeetingApp() {
  return (
    <div className="ayc-lm">
      <Routes>
        <Route element={<Shell />}>
          <Route index element={<Welcome />} />
          <Route path="why" element={<Why />} />
          <Route path="vision" element={<Vision />} />
          <Route path="elections" element={<Elections />} />
          <Route path="operation-arkansas" element={<Operation />} />
          <Route path="events" element={<Events />} />
          <Route path="tollette" element={<Tollette />} />
          <Route path="teams" element={<Teams />} />
          <Route path="strike-teams" element={<StrikeTeams />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="close" element={<Close />} />
          <Route path="join" element={<Join />} />
          <Route path="presenter" element={<PresenterHub />} />
          <Route path="presenter/drill/:drillId" element={<PresenterDrillPage />} />
          <Route path="presenter/:slideId" element={<PresenterSlidePage />} />
          <Route path="*" element={<Navigate to={MEETING_BASE} replace />} />
        </Route>
      </Routes>
    </div>
  )
}
