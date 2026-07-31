import { ContactForm } from '@/features/leader/ContactForm'
import { RequireLeaderAccess } from '@/features/leader/RequireLeaderAccess'

export function NewContactPage() {
  return (
    <RequireLeaderAccess>
      <ContactForm />
    </RequireLeaderAccess>
  )
}
