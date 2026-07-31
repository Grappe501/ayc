import { Button } from '@/components/ui/Button'
import '@/components/ui/ui.css'

export function DirectoryPage() {
  return (
    <div>
      <p className="page-eyebrow">Leadership Directory</p>
      <h1>Find the people and places building the Arkansas Youth Coalition.</h1>
      <p className="page-lede">
        Search, filters, and People / Teams / Locations views arrive with the data foundation. The
        directory is ready for its first contact.
      </p>
      <div className="surface empty-panel">
        <h2>No contacts yet</h2>
        <p>Add the first leader or volunteer from the Leader Board once contact entry ships.</p>
        <div className="btn-row">
          <Button to="/leader" variant="primary">
            Open Leader Board
          </Button>
          <Button to="/" variant="secondary">
            Return Home
          </Button>
        </div>
      </div>
    </div>
  )
}
