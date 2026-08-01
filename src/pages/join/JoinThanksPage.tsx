import { Link, useSearchParams } from 'react-router-dom'
import { DocumentMeta } from '@/components/seo/DocumentMeta'
import { Button } from '@/components/ui'
import '../landing/landing.css'
import './join.css'

export function JoinThanksPage() {
  const [params] = useSearchParams()
  const reference = params.get('ref')?.trim() || ''
  const teamName = params.get('team')?.trim() || 'AYC'
  const duplicate = params.get('dup') === '1'

  return (
    <div className="join-page">
      <DocumentMeta
        title="Application received | Arkansas Youth Coalition"
        description="Thanks for applying to join AYC leadership."
      />
      <p className="landing__eyebrow">You are in the queue</p>
      <h1>{duplicate ? 'We already have you on file.' : 'Thank you for applying.'}</h1>
      <p className="page-header__lede">
        {duplicate ? (
          <>
            Your application was saved for review and flagged as a possible match to an existing
            contact
            {reference ? (
              <>
                {' '}
                (<strong>{reference}</strong>)
              </>
            ) : null}
            . Chance will follow up.
          </>
        ) : (
          <>
            Your join application for <strong>{teamName}</strong> is with Chance for review
            {reference ? (
              <>
                . Reference <strong>{reference}</strong>
              </>
            ) : null}
            . You are not on the public roster until a lead accepts your application.
          </>
        )}
      </p>
      <div className="btn-row">
        <Button to="/" variant="primary">
          Back to home
        </Button>
        <Button to="/directory" variant="secondary">
          Explore the directory
        </Button>
      </div>
      <p className="field__hint" style={{ marginTop: '1.5rem' }}>
        Questions? Use the <Link to="/feedback">feedback form</Link>.
      </p>
    </div>
  )
}
