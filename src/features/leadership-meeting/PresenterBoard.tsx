import { Link, useParams } from 'react-router-dom'
import { MISSION, SLIDES } from './content'
import { meetingPath } from './paths'

type Note = { goal: string; talk: string[]; ask: string; watch: string }

const NOTES: Record<string, Note> = {
  welcome: {
    goal: 'Set warmth, urgency and youth ownership.',
    talk: [
      'Welcome everyone by name if possible.',
      'This is a working leadership meeting, not a lecture.',
      'Preview the five-person challenge and tonight’s decisions.',
    ],
    ask: 'Stay present and decide what you will own.',
    watch: 'Keep this to two minutes; do not front-load details.',
  },
  why: {
    goal: 'Explain why a connected youth network matters now.',
    talk: [
      'Young people already lead in separate places.',
      'AYC connects campuses and counties so knowledge travels.',
      'Collective power means coordinated people who can influence laws and elections.',
    ],
    ask: 'Think of the first person outside this room you will invite.',
    watch: 'Say power as shared civic capacity, not domination.',
  },
  vision: {
    goal: 'Land the mission and measurable growth challenge.',
    talk: [
      MISSION,
      'State the current count from the live roster before the meeting; do not guess.',
      'Every leader adds five people by next Thursday: 11 leaders can reach 55.',
      'Each five becomes a durable local unit, not a one-time contact list.',
    ],
    ask: 'Text your five names into your notes tonight.',
    watch: 'Update the live membership number from the AYC workbench before speaking.',
  },
  elections: {
    goal: 'Turn election urgency into lawful, youth-led campus action.',
    talk: [
      'Election Day is November 3, 2026.',
      'Registration drives begin as campuses reopen.',
      'Teach students how to evaluate candidates and issues; never tell them how they must vote.',
      'Add early voting, voting plans, rides, poll-worker education and ballot-issue learning.',
    ],
    ask: 'Schedule one registration-plus-social event now.',
    watch:
      'Keep AYC activity nonpartisan unless a separately authorized campaign event is clearly identified.',
  },
  operation: {
    goal: 'Make statewide coverage feel achievable.',
    talk: [
      'Goal: every college, high school and county connected by Labor Day.',
      'Start with existing friends, jobs, clubs and family networks.',
      'Each five owns follow-up and reaches one new geography.',
      'A short daily message or introduction is enough to keep momentum.',
    ],
    ask: 'Name your campus/county and one place you can connect next.',
    watch:
      'Do not promise complete chapters everywhere; the target is a real point of contact and pathway to organize.',
  },
  events: {
    goal: 'Give leaders easy, repeatable social-event models.',
    talk: [
      'Make it recurring: same time and place builds habit.',
      'Put fun first and add a short civic action.',
      'Lunch, coffee, apartment hangouts, games and creative nights all count.',
      'Every event needs a welcome person and one next step.',
    ],
    ask: 'Put one recurring gathering on the calendar.',
    watch: 'Keep events accessible, safe and age-appropriate.',
  },
  tollette: {
    goal: 'Use a real story to show youth leadership in public.',
    talk: [
      'Correct spelling is Tollette, in Howard County.',
      'Describe what Keithan and Tyler saw and felt.',
      'Chance introduced AYC and Kelly Grappe at a candidate rally.',
      'Showing up in small communities builds trust and visibility.',
    ],
    ask: 'Volunteer to tell AYC’s story at the next community event.',
    watch: 'The requested video was not found locally; do not improvise a social-media link.',
  },
  teams: {
    goal: 'Make the five lanes concrete and interdependent.',
    talk: [
      'Organizer holds the unit together.',
      'Social Media tells the story.',
      'Outreach expands relationships.',
      'Events create belonging.',
      'Voter Registration turns civic interest into participation.',
      'People may lead one team and volunteer on another.',
    ],
    ask: 'Choose one primary lane and one supporting lane.',
    watch: 'Keep every duty tied to recruiting, growing, educating or acting together.',
  },
  strike: {
    goal: 'Launch five fun, flexible regional action teams.',
    talk: [
      'Five regions: Northwest, Northeast, Central, Southwest, Southeast.',
      'Team chooses Saturday or Sunday and the time.',
      'Start with food, music and games; then canvass or engage campus.',
      'Target two to three hours, not an all-day burden.',
    ],
    ask: 'Pick a region and help choose the first date.',
    watch: 'Plan adult support, transportation and safety for minors.',
  },
  calendar: {
    goal: 'Turn the weekend into the immediate action opportunity.',
    talk: [
      'Friday 6:30 PM Arkadelphia: pizzas and leadership retreat.',
      'Saturday morning Hope: festival lesson and team outreach; leave at 2 PM.',
      'Saturday Henderson: donated college table at Clinton Day Dinner; business/semi-formal.',
      'Saturday movie night; Sunday country breakfast by Steve.',
    ],
    ask: 'Confirm who is driving, who needs a ride and who is joining each segment.',
    watch: 'Verify exact meeting address, transport contacts and festival credentials before sharing publicly.',
  },
  close: {
    goal: 'End with named commitments and space for questions.',
    talk: [
      'Repeat: five new people each by next Thursday.',
      'Ask each leader to name a team lane and one calendar action.',
      'Capture unanswered questions and assign follow-up owners.',
    ],
    ask: 'Say your commitment out loud before leaving.',
    watch: 'Do not let Q/A erase the commitment round.',
  },
}

export function PresenterHub() {
  return (
    <div className="presenter">
      <header className="presenter-hero">
        <p className="eyebrow">Private · link-only</p>
        <h1>AYC Presenter Board</h1>
        <p className="lead">
          Speaker notes for tonight’s leadership meeting. This route is intentionally absent from
          public navigation.
        </p>
      </header>
      <div className="presenter-path">
        {SLIDES.map((s, i) => (
          <Link className="presenter-path-card" to={meetingPath(`/presenter/${s.id}`)} key={s.id}>
            <span className="num">{i + 1}</span>
            <span>
              <strong>{s.navLabel}</strong>
              <em>{s.speaker}</em>
            </span>
          </Link>
        ))}
      </div>
    </div>
  )
}

export function PresenterSlidePage() {
  const { slideId = 'welcome' } = useParams()
  const i = SLIDES.findIndex((s) => s.id === slideId)
  const s = SLIDES[i]
  const n = NOTES[slideId]
  if (!s || !n) return <NavigateHome />
  return (
    <div className="presenter">
      <div className="presenter-toolbar">
        <Link to={meetingPath('/presenter')}>← Board</Link>
        <span>
          {i + 1} / {SLIDES.length}
        </span>
        <Link to={s.path}>Audience slide ↗</Link>
      </div>
      <header className="presenter-slide-head">
        <p className="eyebrow">Speaker · {s.speaker}</p>
        <h1>{s.title}</h1>
      </header>
      <div className="presenter-grid">
        <aside className="presenter-rail">
          <div className="card accent">
            <h3>Purpose</h3>
            <p>{n.goal}</p>
          </div>
          <div className="card">
            <h3>Direct ask</h3>
            <p>{n.ask}</p>
          </div>
        </aside>
        <main>
          <section className="p-block">
            <h3>Talking points</h3>
            <ul>
              {n.talk.map((x) => (
                <li key={x}>{x}</li>
              ))}
            </ul>
          </section>
          <section className="p-block">
            <h3>Watch-out</h3>
            <p>{n.watch}</p>
          </section>
          <div className="presenter-toolbar">
            {i > 0 ? (
              <Link to={meetingPath(`/presenter/${SLIDES[i - 1].id}`)}>← Previous</Link>
            ) : (
              <span />
            )}
            {i < SLIDES.length - 1 ? (
              <Link to={meetingPath(`/presenter/${SLIDES[i + 1].id}`)}>Next →</Link>
            ) : (
              <Link to={meetingPath('/presenter')}>Finish</Link>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

function NavigateHome() {
  return (
    <div className="presenter">
      <h1>Notes not found</h1>
      <Link to={meetingPath('/presenter')}>Return to board</Link>
    </div>
  )
}
