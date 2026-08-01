import { Section, Tag } from '@/components/ui'
import { getLocationTeamMission } from '@/content/locationTeamMissions'

type Props = {
  locationType: string
  locationName: string
  stats?: {
    missingContact: number
    prospective: number
    teamsRepresented: number
    total: number
  }
}

function todayPriorities(
  locationType: string,
  stats?: Props['stats'],
): string[] {
  const mission = getLocationTeamMission(locationType)
  const dynamic: string[] = []

  if (stats && stats.total === 0) {
    dynamic.push(`Add the first contact at ${mission.label.toLowerCase()} level`)
  }
  if (stats && stats.missingContact > 0) {
    dynamic.push(
      `Fill ${stats.missingContact} contact gap${stats.missingContact === 1 ? '' : 's'}`,
    )
  }
  if (stats && stats.prospective > 0) {
    dynamic.push(
      `Advance ${stats.prospective} prospective record${stats.prospective === 1 ? '' : 's'}`,
    )
  }
  if (stats && stats.teamsRepresented === 0 && stats.total > 0) {
    dynamic.push('Assign people to category teams so local boards can staff up')
  }

  if (dynamic.length > 0) return dynamic.slice(0, 4)
  return mission.focusAreas.slice(0, 3)
}

export function LocationTeamMissionPanel({ locationType, locationName, stats }: Props) {
  const mission = getLocationTeamMission(locationType)
  const priorities = todayPriorities(locationType, stats)

  return (
    <Section id="mission" title="Mission">
      <div className="team-mission">
        <div className="team-mission__hero">
          <Tag>{mission.label} TEAM charge</Tag>
          <h3 className="team-mission__charge">{mission.charge}</h3>
          <p className="team-mission__purpose">{mission.purpose}</p>
          <p className="team-mission__serves">{mission.servesCoalition}</p>
          <p className="field__hint">Operating charge for {locationName} — not a rewrite of AYC’s mission.</p>
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
            {stats && (stats.missingContact > 0 || stats.prospective > 0)
              ? 'Drawn from this location’s roster stats.'
              : 'Standing focus while the roster looks healthy.'}
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
