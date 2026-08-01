import { Routes, Route } from 'react-router-dom'
import { AppShell } from '@/components/layout/AppShell'
import { HomePage } from '@/pages/landing/HomePage'
import { ContactDetailPage } from '@/pages/leader/ContactDetailPage'
import { FeedbackInboxPage } from '@/pages/leader/FeedbackInboxPage'
import { GapFillPage } from '@/pages/leader/GapFillPage'
import { LeaderPage } from '@/pages/leader/LeaderPage'
import { NewContactPage } from '@/pages/leader/NewContactPage'
import { TeamBoardPage } from '@/pages/leader/TeamBoardPage'
import { DirectoryPage } from '@/pages/directory/DirectoryPage'
import { DirectoryPersonPage } from '@/pages/directory/DirectoryPersonPage'
import { FeedbackPage } from '@/pages/feedback/FeedbackPage'
import { NotFoundPage } from '@/pages/not-found/NotFoundPage'

export function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/leader" element={<LeaderPage />} />
        <Route path="/leader/gaps" element={<GapFillPage />} />
        <Route path="/leader/feedback" element={<FeedbackInboxPage />} />
        <Route path="/leader/teams/:teamSlug" element={<TeamBoardPage />} />
        <Route path="/leader/contacts/new" element={<NewContactPage />} />
        <Route path="/leader/contacts/:personId" element={<ContactDetailPage />} />
        <Route path="/directory" element={<DirectoryPage />} />
        <Route path="/directory/:personId" element={<DirectoryPersonPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/workbench" element={<LeaderPage />} />
        <Route path="/people" element={<DirectoryPage />} />
        <Route path="/add-contact" element={<NewContactPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
