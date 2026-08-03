import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/landing/HomePage'
import { ContactDetailPage } from '@/pages/leader/ContactDetailPage'
import { ApplicationsInboxPage } from '@/pages/leader/ApplicationsInboxPage'
import { FeedbackInboxPage } from '@/pages/leader/FeedbackInboxPage'
import { CalendarEventDetailPage } from '@/pages/leader/CalendarEventDetailPage'
import { CalendarPage } from '@/pages/leader/CalendarPage'
import { ReportsPage } from '@/pages/leader/ReportsPage'
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
import { AuthCallbackPage } from '@/pages/auth/AuthCallbackPage'
import { ClaimPage } from '@/pages/auth/ClaimPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage'
import { PublicCalendarPage } from '@/pages/calendar/PublicCalendarPage'
import { PublicEventDetailPage } from '@/pages/calendar/PublicEventDetailPage'
import { DirectoryPage } from '@/pages/directory/DirectoryPage'
import { DirectoryPersonPage } from '@/pages/directory/DirectoryPersonPage'
import { FeedbackPage } from '@/pages/feedback/FeedbackPage'
import { JoinPage } from '@/pages/join/JoinPage'
import { JoinThanksPage } from '@/pages/join/JoinThanksPage'
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
        <Route path="/leader/applications" element={<ApplicationsInboxPage />} />
        <Route path="/leader/reports" element={<ReportsPage />} />
        <Route path="/leader/calendar" element={<CalendarPage />} />
        <Route
          path="/leader/calendar/event/:eventId"
          element={<CalendarEventDetailPage />}
        />
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
        <Route path="/calendar" element={<PublicCalendarPage />} />
        <Route path="/calendar/event/:eventId" element={<PublicEventDetailPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route path="/claim" element={<ClaimPage />} />
        <Route path="/join" element={<JoinPage />} />
        <Route path="/join/thanks" element={<JoinThanksPage />} />

        <Route path="/workbench" element={<LeaderPage />} />
        <Route path="/people" element={<DirectoryPage />} />
        <Route path="/add-contact" element={<NewContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
