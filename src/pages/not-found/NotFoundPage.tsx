import { AycLogoMark } from '@/components/brand/AycLogoMark'
import { Button, PageHeader } from '@/components/ui'

export function NotFoundPage() {
  return (
    <div className="ayc-fade-up">
      <AycLogoMark size="md" className="not-found__mark" />
      <PageHeader eyebrow="404" title="Oops." lede="That page doesn't exist." />
      <p className="page-header__lede">
        The link may be outdated, or the page may not be part of the current beta.
      </p>
      <div className="btn-row">
        <Button to="/" variant="primary">
          Return Home
        </Button>
        <Button to="/directory" variant="secondary">
          Open Directory
        </Button>
        <Button to="/join" variant="secondary">
          Join AYC
        </Button>
      </div>
    </div>
  )
}
