import { Section, Tag } from '@/components/ui'
import { getTeamMission } from '@/content/teamMissions'
import type { TeamAttentionDigest } from '@/features/leader/leaderApi'
import type { TeamBoardSlug } from '@/features/leader/teamBoards'

type Props = {
  teamSlug: TeamBoardSlug
  digest?: TeamAttentionDigest | null
}

function todayPriorities(
  teamSlug: TeamBoardSlug,
  digest?: TeamAttentionDigest | null,
): string[] {
  const mission = getTeamMission(teamSlug)
  const dynamic: string[] = []

  if (digest?.noLead) {
    dynamic.push(`Assign a ${digest.name} lead`)
  }
  if (digest && digest.missingContact > 0) {
    dynamic.push(
      `Fill ${digest.missingContact} contact gap${digest.missingContact === 1 ? '' : 's'}`,
    )
  }
  if (digest && digest.joinForm > 0) {
    dynamic.push(
      `Review ${digest.joinForm} join application${digest.joinForm === 1 ? '' : 's'}`,
    )
  } else if (digest && digest.prospective > 0) {
    dynamic.push(
      `Advance ${digest.prospective} prospective record${digest.prospective === 1 ? '' : 's'}`,
    )
  }
  if (digest && digest.needsPreferred > 0) {
    dynamic.push(`Set preferred contact for ${digest.needsPreferred} people`)
  }

  if (dynamic.length > 0) return dynamic.slice(0, 4)
  return mission.focusAreas.slice(0, 3)
}

export function TeamMissionPanel({ teamSlug, digest }: Props) {
  const mission = getTeamMission(teamSlug)
  const priorities = todayPriorities(teamSlug, digest)

  return (
    <Section id="mission" title="Mission">
      <div className="team-mission">
        <div className="team-mission__hero">
          <Tag>Category charge</Tag>
          <h3 className="team-mission__charge">{mission.charge}</h3>
          <p className="team-mission__purpose">{mission.purpose}</p>
          <p className="team-mission__serves">{mission.servesCoalition}</p>
        </div>

        <div className="team-mission__priorities">
          <Tag>Today’s priorities</Tag>
          <h4>Start here</h4>
          <ol className="team-mission__list team-mission__list--numbered">
            {priorities.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ol>
          <p className="field__hint">
            {digest && digest.openItems > 0
              ? `Drawn from this team’s attention digest (${digest.openItems} open).`
              : 'Standing focus while the digest is clear.'}
          </p>
        </div>

        <div className="team-mission__columns">
          <div>
            <h4>Focus areas</h4>
            <ul className="team-mission__list">
              {mission.focusAreas.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Lead owns</h4>
            <ul className="team-mission__list">
              {mission.leadOwns.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Success looks like</h4>
            <ul className="team-mission__list">
              {mission.successLooksLike.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </Section>
  )
}
