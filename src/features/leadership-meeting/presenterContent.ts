import { MISSION, SLIDES } from './content'
import { meetingPath } from './paths'

export type PresenterBlock = {
  heading: string
  bullets: string[]
}

export type PresenterSlideBrief = {
  slideId: string
  audiencePath: string
  timeBox: string
  speaker: string
  whyYouAreHere: string
  whyItMatters: string
  networkFit: string
  audienceSees: string[]
  openWith: string[]
  talkingPoints: PresenterBlock[]
  linesToLand: string[]
  asks: string[]
  watchOuts: string[]
  ifTheyAsk: PresenterBlock[]
  drillDownIds: string[]
}

export type DrillDown = {
  id: string
  title: string
  subtitle: string
  sections: PresenterBlock[]
  relatedSlideIds: string[]
}

export const PRESENTER_SLIDES: PresenterSlideBrief[] = [
  {
    slideId: 'welcome',
    audiencePath: meetingPath('/'),
    timeBox: '0:00–0:03',
    speaker: 'Chance',
    whyYouAreHere:
      'Open the room with warmth and ownership. Make clear this is a working leadership meeting—not a briefing people sit through.',
    whyItMatters:
      'If the first three minutes feel like another Zoom update, energy dies. If they feel recruited into a statewide youth network with a clear scoreboard, everything after lands harder.',
    networkFit:
      'Welcome is the doorway into tonight’s arc: why AYC exists → five-person growth → elections → statewide coverage → social events → Tollette proof → five lanes → Strike Teams → this weekend → named commitments.',
    audienceSees: [
      'Young Arkansas Is Ready',
      'Mission north star',
      '11 leaders · 5 × 5 · November 3',
    ],
    openWith: [
      'Welcome people by name when you can.',
      'Say out loud: this is a working meeting—tonight ends with what you will own.',
      'Preview the five-person challenge without dumping the whole deck.',
    ],
    talkingPoints: [
      {
        heading: 'Tone to set',
        bullets: [
          'Tonight is about turning relationships into a statewide youth network.',
          'Every person here already leads somewhere—AYC connects that energy.',
          'Inspire → Inform → Place → Commit. Depth can be a follow-up; tonight is placement.',
        ],
      },
      {
        heading: 'Scoreboard (plant early, don’t over-explain)',
        bullets: [
          '11 leaders at the table tonight.',
          'Every leader invites five new people by next Thursday → 55.',
          'Election Day November 3, 2026 is the civic deadline on the calendar.',
        ],
      },
      {
        heading: 'What success looks like by the end of the hour',
        bullets: [
          'Each leader can name five people to invite.',
          'Each leader has chosen a primary lane (and optionally a supporting lane).',
          'Weekend logistics confirmed: who is going where, who needs a ride.',
          'Unanswered questions have an owner for follow-up.',
        ],
      },
    ],
    linesToLand: [
      'Tonight is not a lecture. Tonight is about what you will lead next.',
      'Young Arkansas is ready—if we connect and follow through.',
    ],
    asks: ['Stay present through the commitment round.', 'Open the shared audience link if you want to follow along.'],
    watchOuts: [
      'Keep this to about three minutes; do not front-load Operation Arkansas or weekend logistics yet.',
      'Don’t apologize for asking people to work—frame it as ownership.',
    ],
    ifTheyAsk: [
      {
        heading: 'Quick answers',
        bullets: [
          '“What is AYC?” → youth-led statewide network; read the mission once, then move.',
          '“Is this partisan?” → civic participation and voter education; elections slide covers boundaries.',
        ],
      },
    ],
    drillDownIds: ['meeting-arc', 'five-person-model', 'mission-power'],
  },
  {
    slideId: 'why',
    audiencePath: meetingPath('/why'),
    timeBox: '0:03–0:07',
    speaker: 'Xay',
    whyYouAreHere:
      'Name why a connected network matters now. Move people out of “audience mode” into “builder mode.”',
    whyItMatters:
      'Without this hinge, sign-ups feel pushy later. With it, invitations and lane choices feel natural.',
    networkFit:
      'This slide converts scattered campus/county energy into permission to operate as one Arkansas youth power base.',
    audienceSees: [
      'This Is Our Moment to Build',
      'Connect · Lead · Build power',
    ],
    openWith: [
      'Young people already have relationships, creativity, and numbers.',
      'The gap is connection—so no campus or county has to organize alone.',
    ],
    talkingPoints: [
      {
        heading: 'The problem we solve',
        bullets: [
          'Talent and leadership already exist in separate places.',
          'Without a network, knowledge dies in one school or one friend group.',
          'Collective power = coordinated people who can influence laws and elections together.',
        ],
      },
      {
        heading: 'Three verbs to land',
        bullets: [
          'Connect — turn scattered energy into one statewide network.',
          'Lead — give young Arkansans ownership, responsibility, and support.',
          'Build power — recruit, educate, and act until leaders must listen.',
        ],
      },
      {
        heading: 'Language for “power”',
        bullets: [
          'Say power as shared civic capacity—not domination or intimidation.',
          'Power looks like: registered voters, recurring gatherings, trusted messengers, and follow-through.',
        ],
      },
    ],
    linesToLand: [
      'Young people already lead. AYC makes sure that leadership travels.',
      'No campus, school, or county has to organize alone.',
    ],
    asks: ['Think of the first person outside this room you will invite.'],
    watchOuts: [
      'Don’t turn this into a long history of AYC—stay in the present tense.',
      'Don’t over-promise “we will flip everything”; promise coordinated action.',
    ],
    ifTheyAsk: [
      {
        heading: 'If someone says “I’m already busy”',
        bullets: [
          'Agree—then reframe: AYC fits into life via short invites, one recurring hangout, and one clear lane.',
          'Point ahead to Events and Teams slides for concrete, small commitments.',
        ],
      },
    ],
    drillDownIds: ['mission-power', 'five-person-model', 'meeting-arc'],
  },
  {
    slideId: 'vision',
    audiencePath: meetingPath('/vision'),
    timeBox: '0:07–0:13',
    speaker: 'Chance',
    whyYouAreHere:
      'Land the mission and the measurable growth challenge: five people each by next Thursday.',
    whyItMatters:
      'This is the scoreboard of the night. If people leave fuzzy on the five, the meeting failed even if they “liked” the slides.',
    networkFit:
      '11 → 55 → 275 is the compounding model that makes Labor Day coverage and Election Day turnout possible.',
    audienceSees: [
      'Five People Each. One Statewide Power Base.',
      '11 → 55 → 275 → statewide',
      'Full mission statement',
    ],
    openWith: [
      'Read or paraphrase the mission once—slowly.',
      'State the live membership number from the roster before the meeting; do not guess.',
      'Then land the ask: five names by next Thursday.',
    ],
    talkingPoints: [
      {
        heading: 'Mission (say it as belonging, not jargon)',
        bullets: [
          MISSION,
          'Emphasize: statewide · youth-led · organizing · voters · community · lasting civic power.',
        ],
      },
      {
        heading: 'The math (make it feel doable)',
        bullets: [
          '11 leaders × 5 invites = 55 people in one week if everyone follows through.',
          'Those 55 can each build another five → 275.',
          'Each five is a durable local unit—not a one-time contact list.',
        ],
      },
      {
        heading: 'What “five” means operationally',
        bullets: [
          'Real names, real contacts, a real next touch (text, invite, hangout).',
          'Prefer people who will show up again—not vanity numbers.',
          'Someone can join an existing five or start a new five.',
        ],
      },
    ],
    linesToLand: [
      'Every leader adds five people by next Thursday.',
      'Each five becomes a durable local unit—not a one-time list.',
    ],
    asks: ['Text your five names into your notes before you leave tonight.'],
    watchOuts: [
      'Update the live membership number from the AYC workbench before speaking.',
      'Don’t invent a roster count mid-sentence—if unsure, say “check the board after.”',
    ],
    ifTheyAsk: [
      {
        heading: '“What if I can’t find five?”',
        bullets: [
          'Start with three and name who helps you get to five.',
          'Use school, work, church, clubs, siblings, teammates—Operation Arkansas expands that list.',
        ],
      },
    ],
    drillDownIds: ['five-person-model', 'mission-power', 'five-lanes'],
  },
  {
    slideId: 'elections',
    audiencePath: meetingPath('/elections'),
    timeBox: '0:13–0:19',
    speaker: 'Marlena',
    whyYouAreHere:
      'Turn election urgency into lawful, youth-led campus action—registration, education, turnout—without telling anyone how they must vote.',
    whyItMatters:
      'November 3 is the hard deadline. AYC’s credibility depends on accurate information and clear nonpartisan boundaries unless a separate campaign event is authorized.',
    networkFit:
      'Voter Registration lane + social events + campus contacts = Election Day capacity across Arkansas.',
    audienceSees: [
      'Youth Will Make the Difference',
      'Register · Understand · Turn out · Protect citizen power · Lead a five · Make it social',
    ],
    openWith: [
      'Election Day is November 3, 2026—say the date twice.',
      'Registration drives begin as campuses reopen.',
    ],
    talkingPoints: [
      {
        heading: 'Six moves (cover lightly; depth in drill-down)',
        bullets: [
          'Register — trusted official info and deadlines.',
          'Understand — nonpartisan candidate/issue conversations.',
          'Turn out — voting plans, early vote, rides, peer follow-up.',
          'Protect citizen power — ballot access and local government literacy.',
          'Lead a five — campus groups that own follow-through.',
          'Make it social — pair civic info with belonging.',
        ],
      },
      {
        heading: 'Nonpartisan fence (say clearly)',
        bullets: [
          'Teach how to evaluate candidates and issues; never tell students how they must vote.',
          'If a Kelly Grappe / campaign activity is involved, label it clearly as a separate authorized campaign moment—not “AYC told us who to vote for.”',
        ],
      },
      {
        heading: 'Campus practicalities',
        bullets: [
          'Partner with trusted election resources for deadlines and forms.',
          'Pair a registration table with coffee, lunch, or a club meeting.',
          'Capture contacts so follow-up happens within 48 hours.',
        ],
      },
    ],
    linesToLand: [
      'Youth will make the difference—if we register, educate, and turn out.',
      'We help people decide for themselves. We do not order their ballot.',
    ],
    asks: ['Schedule one registration-plus-social event now—even a rough date.'],
    watchOuts: [
      'Keep AYC activity nonpartisan unless a separately authorized campaign event is clearly identified.',
      'Don’t invent legal advice—point to official election sources.',
    ],
    ifTheyAsk: [
      {
        heading: 'Age / eligibility questions',
        bullets: [
          'Focus on eligible voters; for younger students emphasize education, peer invites, and future registration.',
          'Adult support and safety planning belongs with Strike Teams and weekend logistics.',
        ],
      },
    ],
    drillDownIds: ['elections-nonpartisan', 'five-lanes', 'social-events'],
  },
  {
    slideId: 'operation',
    audiencePath: meetingPath('/operation-arkansas'),
    timeBox: '0:19–0:24',
    speaker: 'Maverick',
    whyYouAreHere:
      'Make statewide coverage feel achievable by Labor Day—every college, high school, and county with a real contact pathway.',
    whyItMatters:
      'Without geography, AYC stays a friend group. With a Labor Day contact map, the network becomes statewide.',
    networkFit:
      'Operation Arkansas is the map; five-person units and Strike Teams are the engines that fill it.',
    audienceSees: [
      'Every Campus. Every County. By Labor Day.',
      'Start where you are · Reach one step farther · Own your five',
    ],
    openWith: [
      'Goal: every college, every high school, every county connected by Labor Day.',
      'Clarify: connected means a real person and pathway—not a perfect chapter everywhere.',
    ],
    talkingPoints: [
      {
        heading: 'Three moves',
        bullets: [
          'Start where you are — school, work, church, clubs, friend group.',
          'Reach one step farther — another school or county you already touch.',
          'Own your five — invitations and follow-up are owned, not hoped.',
        ],
      },
      {
        heading: 'What “connected” means',
        bullets: [
          'A named contact who will answer and invite others.',
          'A path to place people into a five and a lane.',
          'A recurring touch (message, hangout, or table)—not a one-off post.',
        ],
      },
      {
        heading: 'Daily rhythm (keep tiny)',
        bullets: [
          'One introduction or short message a day is enough to keep momentum.',
          'Track who you invited and who responded—simple notes beat perfect software.',
        ],
      },
    ],
    linesToLand: [
      'It fits into your life: share info, make introductions, hold one regular gathering.',
      'We are building points of contact—not promising perfect chapters everywhere by Labor Day.',
    ],
    asks: ['Name your campus/county and one place you can connect next.'],
    watchOuts: [
      'Do not promise complete chapters everywhere; the target is a real contact and pathway.',
      'Don’t let this become a 20-minute geography lecture—five minutes, then hand off.',
    ],
    ifTheyAsk: [
      {
        heading: '“My county feels empty”',
        bullets: [
          'Start with one school or workplace and one five.',
          'Use Strike Teams and weekend travel to seed visibility, then leave a contact behind.',
        ],
      },
    ],
    drillDownIds: ['operation-arkansas', 'five-person-model', 'strike-regions'],
  },
  {
    slideId: 'events',
    audiencePath: meetingPath('/events'),
    timeBox: '0:24–0:29',
    speaker: 'Marlena',
    whyYouAreHere:
      'Give leaders easy, repeatable social-event models so civic life feels like belonging—not homework.',
    whyItMatters:
      'Recurring socials are how fives stay alive between big weekends and Election Day.',
    networkFit:
      'Events lane + social model = retention. Without belonging, registration drives are one-offs.',
    audienceSees: [
      'Make It Social. Make It Regular. Make It a Thing.',
      'Coffee · lunch · hangouts · pop-ups · creative nights · candidate/issue socials',
    ],
    openWith: [
      'The best youth organizing can look like what we already enjoy—with a consistent place and a next step.',
      'Recurring > impressive one-time.',
    ],
    talkingPoints: [
      {
        heading: 'Design rules',
        bullets: [
          'Same time and place builds habit.',
          'Fun first; short civic action second (15 minutes can be enough).',
          'Every event needs a welcome person and one next step (join a five, register, invite a friend).',
        ],
      },
      {
        heading: 'Models they can copy tomorrow',
        bullets: [
          'Monday coffee / Thursday lunch — reserve a table, post the invite.',
          'Dorm or apartment hangout — music, food, games, 15 minutes of planning.',
          'Campus pop-up — snacks + visible AYC welcome + registration.',
          'Creative night — posters, reels, invitations together.',
        ],
      },
      {
        heading: 'Accessibility',
        bullets: [
          'Keep events accessible, safe, and age-appropriate.',
          'Be clear about cost, transportation, and who is welcoming new people.',
        ],
      },
    ],
    linesToLand: [
      'Make it social. Make it regular. Make it a thing.',
      'If it isn’t welcoming, it isn’t organizing.',
    ],
    asks: ['Put one recurring gathering on the calendar before you leave.'],
    watchOuts: [
      'Don’t invent a 12-event master calendar tonight—one recurring hangout is the win.',
      'Keep candidate/issue socials educational and welcoming; revisit nonpartisan fence if needed.',
    ],
    ifTheyAsk: [
      {
        heading: '“We don’t have money”',
        bullets: [
          'Coffee tables, dorm hangouts, and park meetups work.',
          'Focus on consistency and welcome, not production value.',
        ],
      },
    ],
    drillDownIds: ['social-events', 'five-lanes', 'weekend-logistics'],
  },
  {
    slideId: 'tollette',
    audiencePath: meetingPath('/tollette'),
    timeBox: '0:29–0:33',
    speaker: 'Keithan & Tyler',
    whyYouAreHere:
      'Use a real Howard County story so statewide goals feel human—youth showing up with confidence and purpose.',
    whyItMatters:
      'Tollette proves small communities matter and that a clear youth message changes what people imagine is possible.',
    networkFit:
      'Story → credibility → invitation. This is the emotional proof before lanes and Strike Teams.',
    audienceSees: [
      'AYC Showed Up in Tollette',
      'What happened · What we learned',
      'Video placeholder (asset pending)',
    ],
    openWith: [
      'Correct spelling: Tollette, Howard County.',
      'Hand the story to Keithan and Tyler—first person beats summary.',
    ],
    talkingPoints: [
      {
        heading: 'Story beats',
        bullets: [
          'What they saw and felt at the local candidate rally.',
          'Chance addressed the crowd, introduced AYC, and connected youth leadership to Kelly Grappe’s Secretary of State campaign—label the campaign piece clearly.',
          'Showing up in small communities builds trust and visibility.',
        ],
      },
      {
        heading: 'Lessons to land',
        bullets: [
          'Small communities matter.',
          'Showing up creates trust.',
          'A young leader with a clear message expands what people think is possible.',
        ],
      },
      {
        heading: 'Media',
        bullets: [
          'Video asset was not found in the media library—do not invent a social link.',
          'If a clip arrives later, replace the placeholder; until then, tell the story live.',
        ],
      },
    ],
    linesToLand: [
      'We showed up in Howard County—and people noticed.',
      'Statewide power includes small towns, not only big campuses.',
    ],
    asks: ['Volunteer to tell AYC’s story at the next community event.'],
    watchOuts: [
      'Don’t improvise a social-media link for missing video.',
      'Keep campaign references clearly labeled; keep AYC’s ongoing identity youth-led and civic.',
    ],
    ifTheyAsk: [
      {
        heading: '“Can we get the video?”',
        bullets: [
          'Not in the library yet—speakers tell the story; media team follows up after.',
        ],
      },
    ],
    drillDownIds: ['tollette-story', 'mission-power', 'operation-arkansas'],
  },
  {
    slideId: 'teams',
    audiencePath: meetingPath('/teams'),
    timeBox: '0:33–0:39',
    speaker: 'Keithan & Maverick',
    whyYouAreHere:
      'Make the five lanes concrete and interdependent so people can choose a primary role tonight.',
    whyItMatters:
      'Without lanes, “I’ll help” evaporates. With lanes, follow-up has an owner.',
    networkFit:
      'Lead Organizer · Social Media · Outreach · Events · Voter Registration = the operating system of each five.',
    audienceSees: [
      'Five Teams Build Collective Power',
      'Five duty cards (lanes)',
    ],
    openWith: [
      'Each lane has a clear job; together they recruit, grow, educate, and act.',
      'You can lead one lane and volunteer on another.',
    ],
    talkingPoints: [
      {
        heading: 'Lane one-liners',
        bullets: [
          'Lead Organizer — holds the unit together, welcomes, sets the weekly goal.',
          'Social Media — tells the story; short video and campus posts.',
          'Outreach — expands relationships beyond the current circle.',
          'Events — recurring gatherings that create belonging.',
          'Voter Registration — registration culture and accurate deadlines.',
        ],
      },
      {
        heading: 'Placement method',
        bullets: [
          'Ask: which lane energizes you? which will you support?',
          'Capture choices in notes / workbench after—don’t lose them in chat.',
          'Every duty should tie to recruiting, growing, educating, or acting together.',
        ],
      },
    ],
    linesToLand: [
      'Pick a primary lane tonight. Supporting lanes can wait—but primary cannot.',
      'The five only works if the lanes talk to each other.',
    ],
    asks: ['Choose one primary lane and one supporting lane.'],
    watchOuts: [
      'Don’t let this become a job-description seminar—one-liners + choice.',
      'Avoid shaming people who need time; still ask for a provisional primary.',
    ],
    ifTheyAsk: [
      {
        heading: '“Can two people share Organizer?”',
        bullets: [
          'Yes short-term—name a lead contact so follow-up isn’t orphaned.',
        ],
      },
    ],
    drillDownIds: ['five-lanes', 'five-person-model', 'social-events'],
  },
  {
    slideId: 'strike',
    audiencePath: meetingPath('/strike-teams'),
    timeBox: '0:39–0:43',
    speaker: 'Xavion',
    whyYouAreHere:
      'Launch five regional Strike Teams as fun, flexible weekend missions—not all-day burdens.',
    whyItMatters:
      'Strike Teams create visible statewide motion between campus micro-events and Election Day.',
    networkFit:
      'Regions + weekend action + five-person units = Operation Arkansas in motion.',
    audienceSees: [
      'Five Regions. One Fun Weekend Mission.',
      'Northwest · Northeast · Central · Southwest · Southeast',
      'Gather · Have fun · Reach out',
    ],
    openWith: [
      'Five regions: Northwest, Northeast, Central, Southwest, Southeast.',
      'Team chooses Saturday or Sunday and the time—two to three hours.',
    ],
    talkingPoints: [
      {
        heading: 'Mission shape',
        bullets: [
          'Gather — park or campus, matching AYC shirts if available.',
          'Have fun — food, music, games; welcome people naturally.',
          'Reach out — talk, then 1–2 hours canvassing or campus engagement.',
        ],
      },
      {
        heading: 'Safety and adults',
        bullets: [
          'Plan adult support, transportation, and safety for minors before the first mission.',
          'Know who is driving, who is staying with whom, and how people get home.',
        ],
      },
    ],
    linesToLand: [
      'Two or three hours. The team chooses the time. Leadership should feel energizing—not overwhelming.',
    ],
    asks: ['Pick a region and help choose the first date.'],
    watchOuts: [
      'Don’t schedule five regions tonight in perfect detail—get region interest + a first window.',
      'Never skip safety/transport for minors.',
    ],
    ifTheyAsk: [
      {
        heading: '“What if my region has two people?”',
        bullets: [
          'Start with those two + guests; borrow friends from adjacent regions for the first mission.',
        ],
      },
    ],
    drillDownIds: ['strike-regions', 'weekend-logistics', 'operation-arkansas'],
  },
  {
    slideId: 'calendar',
    audiencePath: meetingPath('/calendar'),
    timeBox: '0:43–0:48',
    speaker: 'Madison',
    whyYouAreHere:
      'Turn this weekend into the immediate action opportunity—rides, dress code, and who is where.',
    whyItMatters:
      'If logistics stay fuzzy, people ghost. If logistics are clear, the weekend becomes proof of AYC.',
    networkFit:
      'Arkadelphia → Hope → Henderson is the near-term proof point for teams, story, and outreach.',
    audienceSees: [
      'Arkadelphia · Hope · Henderson',
      'Friday retreat · Saturday Hope · Saturday Henderson · movie + Sunday breakfast',
    ],
    openWith: [
      'Walk the timeline once, slowly.',
      'Then switch to logistics: drivers, riders, dress code, leave times.',
    ],
    talkingPoints: [
      {
        heading: 'Timeline',
        bullets: [
          'Friday 6:30 PM Arkadelphia — pizzas + leadership retreat; cars from Little Rock.',
          'Saturday morning Hope — festival lesson, shirts, giveaways; leave at 2 PM.',
          'Saturday evening Henderson — college table at Clinton Day Dinner; business/semi-formal.',
          'Saturday night movie · Sunday Steve’s country breakfast · then home.',
        ],
      },
      {
        heading: 'Logistics checklist (confirm live)',
        bullets: [
          'Who is driving / who needs a ride.',
          'Exact meeting address and transport contacts (verify before public posts).',
          'Festival credentials / table expectations if any.',
          'Dress code for Henderson: suits, sport coats, cocktail or pant suits—no prom dresses.',
        ],
      },
    ],
    linesToLand: [
      'This weekend is the first test of follow-through—say if you are in, and how you are getting there.',
    ],
    asks: ['Confirm who is driving, who needs a ride, and who is joining each segment.'],
    watchOuts: [
      'Verify exact meeting address, transport contacts, and festival credentials before sharing publicly.',
      'Don’t shame people who can only join one segment—capture what they can do.',
    ],
    ifTheyAsk: [
      {
        heading: 'Missing details',
        bullets: [
          'If an address isn’t confirmed, say so and assign who will text the group by a set time.',
        ],
      },
    ],
    drillDownIds: ['weekend-logistics', 'strike-regions', 'social-events'],
  },
  {
    slideId: 'close',
    audiencePath: meetingPath('/close'),
    timeBox: '0:48–0:55',
    speaker: 'Chance',
    whyYouAreHere:
      'End with named commitments and space for questions—without letting Q/A erase the ask.',
    whyItMatters:
      'This is the conversion moment. Everything before was setup.',
    networkFit:
      'Commitments feed the workbench: five invites, lane choice, weekend action.',
    audienceSees: [
      'What Will You Lead Next?',
      'Add five · Choose a lane · Show up',
    ],
    openWith: [
      'Repeat: five new people each by next Thursday.',
      'Tell them you will go around for commitments before open Q/A.',
    ],
    talkingPoints: [
      {
        heading: 'Commitment round (run it)',
        bullets: [
          'Each leader: five names (or progress), primary lane, one calendar/weekend action.',
          'Capture unanswered questions and assign follow-up owners.',
          'Thank people specifically for what they owned.',
        ],
      },
      {
        heading: 'Q/A discipline',
        bullets: [
          'Park deep operational questions for after commitments.',
          'If time is short: take two questions, then extended Q/A optional.',
        ],
      },
    ],
    linesToLand: [
      'The network grows when each of us accepts one clear responsibility and follows through.',
      'Say your commitment out loud before leaving.',
    ],
    asks: ['Say your commitment out loud before leaving.'],
    watchOuts: [
      'Do not let Q/A erase the commitment round.',
      'Don’t reopen the whole deck—point people to audience slides or drill-downs later.',
    ],
    ifTheyAsk: [
      {
        heading: 'Parking lot',
        bullets: [
          'Write questions on a shared note with an owner and a due time.',
        ],
      },
    ],
    drillDownIds: ['commitment-close', 'five-person-model', 'five-lanes'],
  },
]

export const DRILL_DOWNS: DrillDown[] = [
  {
    id: 'meeting-arc',
    title: 'Meeting arc & timeboxing',
    subtitle: 'How the hour is designed and how to recover if you run long.',
    relatedSlideIds: ['welcome', 'why', 'close'],
    sections: [
      {
        heading: 'Arc',
        bullets: [
          'Welcome → Why → Vision (scoreboard) → Elections → Operation → Events → Tollette → Teams → Strike → Calendar → Close.',
          'Front half = meaning + growth math. Middle = methods. End = placement + weekend + commitments.',
        ],
      },
      {
        heading: 'If you are behind',
        bullets: [
          'Protect Vision ask, Teams lane choice, Calendar logistics, and Close commitments.',
          'Compress Events examples; keep Tollette as a short story; move deep elections into Q/A.',
        ],
      },
      {
        heading: 'Facilitation',
        bullets: [
          'One speaker owns the slide; others amplify only if invited.',
          'Use the meeting clock; Start when the room is actually ready.',
        ],
      },
    ],
  },
  {
    id: 'mission-power',
    title: 'Mission & collective power',
    subtitle: 'Language that keeps “power” civic, shared, and youth-led.',
    relatedSlideIds: ['welcome', 'why', 'vision', 'tollette'],
    sections: [
      {
        heading: 'Mission (keep handy)',
        bullets: [MISSION],
      },
      {
        heading: 'Say this / not that',
        bullets: [
          'Say: shared civic capacity, coordinated action, leaders who must listen.',
          'Don’t say: domination, “we tell people how to vote,” or vague “resistance” without a next step.',
        ],
      },
      {
        heading: 'Proof points',
        bullets: [
          'Recurring gatherings, registration help, campus contacts, Tollette-style showing up.',
          'Workbench roster growth and five-person units completing follow-up.',
        ],
      },
    ],
  },
  {
    id: 'five-person-model',
    title: 'Five-person growth model',
    subtitle: '11 → 55 → 275 and what counts as a real invite.',
    relatedSlideIds: ['vision', 'operation', 'teams', 'close'],
    sections: [
      {
        heading: 'Definition of done for an invite',
        bullets: [
          'Name + way to reach them + next touch scheduled.',
          'They know what AYC is in one sentence.',
          'They have a path into a five and a lane.',
        ],
      },
      {
        heading: 'Anti-patterns',
        bullets: [
          'Counting silent likes or “maybe” DMs as five.',
          'One big group chat with no organizer.',
          'Inviting only people who already do everything—expand the circle.',
        ],
      },
      {
        heading: 'Follow-up cadence',
        bullets: [
          'Invite day 0 → reminder day 2 → hangout or call by day 7.',
          'Organizer tracks who is warm / cold / placed.',
        ],
      },
    ],
  },
  {
    id: 'elections-nonpartisan',
    title: 'Elections & nonpartisan fence',
    subtitle: 'Registration, education, turnout—without ordering anyone’s ballot.',
    relatedSlideIds: ['elections', 'events', 'teams'],
    sections: [
      {
        heading: 'AYC default posture',
        bullets: [
          'Help eligible students register with accurate official information.',
          'Host nonpartisan learning spaces so peers evaluate candidates and issues.',
          'Build turnout habits: plans, early vote, rides, peer reminders.',
        ],
      },
      {
        heading: 'Campaign moments',
        bullets: [
          'If AYC members appear at a candidate rally (e.g. Tollette), label the campaign piece clearly.',
          'Don’t blur “AYC civic education” with “campaign persuasion” unless authorized and explicit.',
        ],
      },
      {
        heading: 'Useful campus pairings',
        bullets: [
          'Registration + coffee table.',
          'Issue conversation + club meeting.',
          'Early-vote walk + friend group chat reminder.',
        ],
      },
    ],
  },
  {
    id: 'operation-arkansas',
    title: 'Operation Arkansas coverage',
    subtitle: 'Labor Day contact map for campuses, schools, and counties.',
    relatedSlideIds: ['operation', 'strike', 'vision'],
    sections: [
      {
        heading: 'Coverage definition',
        bullets: [
          'A named contact + invite pathway + recurring touch.',
          'Not required: formal chapter bylaws everywhere by Labor Day.',
        ],
      },
      {
        heading: 'How to expand geography',
        bullets: [
          'Start with existing relationships across schools and counties.',
          'Leave a contact behind after Strike Team visits.',
          'Use workbench directory to avoid duplicate outreach.',
        ],
      },
      {
        heading: 'Reporting',
        bullets: [
          'Track: place · contact · next step · date.',
          'Celebrate new contacts weekly so Labor Day feels measurable.',
        ],
      },
    ],
  },
  {
    id: 'social-events',
    title: 'Social event model',
    subtitle: 'Recurring, welcoming, civic—without heavy production.',
    relatedSlideIds: ['events', 'elections', 'teams'],
    sections: [
      {
        heading: 'Minimum viable event',
        bullets: [
          'Time + place + welcome person + one civic next step.',
          'Invite list from the five + one open campus call.',
        ],
      },
      {
        heading: 'Retention tricks',
        bullets: [
          'Same hour weekly beats rotating venues.',
          'Photograph faces (with consent) and tag the story—Social Media lane.',
          'End with “who are you bringing next time?”',
        ],
      },
      {
        heading: 'Safety',
        bullets: [
          'Age-appropriate spaces; clear adult support when minors are present.',
          'Know exit plans and who is responsible for guests.',
        ],
      },
    ],
  },
  {
    id: 'tollette-story',
    title: 'Tollette / Howard County story',
    subtitle: 'Beats, spelling, campaign labeling, and missing video.',
    relatedSlideIds: ['tollette', 'why', 'operation'],
    sections: [
      {
        heading: 'Facts to keep straight',
        bullets: [
          'Spelling: Tollette. County: Howard.',
          'Speakers: Keithan & Tyler (first person). Chance spoke publicly about AYC and connected youth leadership to Kelly Grappe’s campaign—label that piece.',
        ],
      },
      {
        heading: 'Emotional landing',
        bullets: [
          'Small towns are not afterthoughts.',
          'Showing up with clarity builds trust.',
          'Invite others to tell AYC’s story locally.',
        ],
      },
      {
        heading: 'Media status',
        bullets: [
          'Video placeholder remains until an approved file/embed is provided.',
          'Do not invent links under time pressure.',
        ],
      },
    ],
  },
  {
    id: 'five-lanes',
    title: 'Five local lanes',
    subtitle: 'Organizer, Social Media, Outreach, Events, Voter Registration.',
    relatedSlideIds: ['teams', 'vision', 'close'],
    sections: [
      {
        heading: 'Interdependence',
        bullets: [
          'Organizer without Outreach stalls growth.',
          'Events without Registration miss civic conversion.',
          'Social Media without real gatherings becomes empty content.',
        ],
      },
      {
        heading: 'Weekly pulse (suggested)',
        bullets: [
          'Organizer: one check-in + goal.',
          'Outreach: three invites.',
          'Events: confirm next hangout.',
          'Social: one post/story.',
          'VR: one accurate info share or table plan.',
        ],
      },
      {
        heading: 'Placement phrases',
        bullets: [
          '“What energizes you more—people, story, logistics, or voters?”',
          '“Who do you want as your backup lane?”',
        ],
      },
    ],
  },
  {
    id: 'strike-regions',
    title: 'Strike Team regions',
    subtitle: 'Five regions, short missions, safety first.',
    relatedSlideIds: ['strike', 'operation', 'calendar'],
    sections: [
      {
        heading: 'Regions',
        bullets: [
          'Northwest · Northeast · Central · Southwest · Southeast',
          'People can help seed an adjacent region for the first mission.',
        ],
      },
      {
        heading: 'Mission template (2–3 hours)',
        bullets: [
          'Gather → fun/welcome → canvass or campus engagement → capture contacts → debrief next step.',
        ],
      },
      {
        heading: 'Non-negotiables',
        bullets: [
          'Adult support and transport plan when minors participate.',
          'Leave-behind contact for Operation Arkansas coverage.',
        ],
      },
    ],
  },
  {
    id: 'weekend-logistics',
    title: 'This weekend logistics',
    subtitle: 'Arkadelphia, Hope, Henderson—rides, dress, leave times.',
    relatedSlideIds: ['calendar', 'strike', 'close'],
    sections: [
      {
        heading: 'Segments',
        bullets: [
          'Fri 6:30 PM Arkadelphia — pizzas + leadership retreat; LR cars.',
          'Sat morning Hope — festival presence; leave 2 PM.',
          'Sat evening Henderson — Clinton Day Dinner college table; business/semi-formal.',
          'Sat movie · Sun breakfast by Steve · home.',
        ],
      },
      {
        heading: 'Confirm live in the room',
        bullets: [
          'Drivers / riders matrix.',
          'Who joins which segments.',
          'Who texts final addresses once verified.',
        ],
      },
      {
        heading: 'Public posting rule',
        bullets: [
          'No public address/credential posts until verified.',
          'Prefer private group messages for sensitive logistics.',
        ],
      },
    ],
  },
  {
    id: 'commitment-close',
    title: 'Commitment round script',
    subtitle: 'How to run the close without losing the ask to Q/A.',
    relatedSlideIds: ['close', 'vision', 'teams'],
    sections: [
      {
        heading: 'Script',
        bullets: [
          '“Before questions: each person—five invites, primary lane, weekend action.”',
          'Go around. Affirm. Capture.',
          'Then: “Two questions now; parking lot for the rest.”',
        ],
      },
      {
        heading: 'Capture fields',
        bullets: [
          'Name · five status · primary lane · supporting lane · weekend segments · questions/owner.',
        ],
      },
      {
        heading: 'After the call',
        bullets: [
          'Update workbench / shared note within 24 hours.',
          'Text reminders for weekend logistics same night.',
        ],
      },
    ],
  },
]

export function getPresenterBrief(slideId: string): PresenterSlideBrief | undefined {
  return PRESENTER_SLIDES.find((s) => s.slideId === slideId)
}

export function getDrillDown(id: string): DrillDown | undefined {
  return DRILL_DOWNS.find((d) => d.id === id)
}

export function presenterSlideIndex(slideId: string): number {
  return PRESENTER_SLIDES.findIndex((s) => s.slideId === slideId)
}

export const PRESENTER_NAV = PRESENTER_SLIDES.map((s) => {
  const slide = SLIDES.find((x) => x.id === s.slideId)
  return {
    id: s.slideId,
    path: meetingPath(`/presenter/${s.slideId}`),
    label: slide?.navLabel ?? s.slideId,
    speaker: s.speaker,
  }
})
