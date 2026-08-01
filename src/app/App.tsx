import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/landing/HomePage'
import { ContactDetailPage } from '@/pages/leader/ContactDetailPage'
import { FeedbackInboxPage } from '@/pages/leader/FeedbackInboxPage'
import { DuplicateMergePage } from '@/pages/leader/DuplicateMergePage'
import { GapFillPage } from '@/pages/leader/GapFillPage'
import { LeaderPage } from '@/pages/leader/LeaderPage'
import { NewContactPage } from '@/pages/leader/NewContactPage'
import {
  LocationCategoryBoardPage,
  LocationTeamBoardPage,
} from '@/pages/leader/LocationBoardPages'
import { SegmentBoardPage } from '@/pages/leader/SegmentBoardPage'
import { GraphicDesignBoardPage, TeamBoardPage } from '@/pages/leader/TeamBoardPage'
import { DirectoryPage } from '@/pages/directory/DirectoryPage'
import { DirectoryPersonPage } from '@/pages/directory/DirectoryPersonPage'
import { FeedbackPage } from '@/pages/feedback/FeedbackPage'
import { JoinPage } from '@/pages/join/JoinPage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/leader" element={<LeaderPage />} />
        <Route path="/leader/gaps" element={<GapFillPage />} />
        <Route path="/leader/duplicates" element={<DuplicateMergePage />} />
        <Route path="/leader/feedback" element={<FeedbackInboxPage />} />
        <Route
          path="/leader/teams/social-media/graphic-design"
          element={<GraphicDesignBoardPage />}
        />
        <Route path="/leader/teams/:teamSlug" element={<TeamBoardPage />} />
        <Route path="/leader/segments/:segmentSlug" element={<SegmentBoardPage />} />
        <Route path="/leader/locations/:locationId" element={<LocationTeamBoardPage />} />
        <Route
          path="/leader/locations/:locationId/teams/:teamSlug"
          element={<LocationCategoryBoardPage />}
        />
        <Route path="/leader/contacts/new" element={<NewContactPage />} />
        <Route path="/leader/contacts/:personId" element={<ContactDetailPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/directory/:personId" element={<DirectoryPersonPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/workbench" element={<LeaderPage />} />
        <Route path="/people" element={<DirectoryPage />} />
        <Route path="/add-contact" element={<NewContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
