/** Canonical AYC mission — do not rewrite (Volume VII). */
export const AYC_MISSION =
  'To unite young people from all walks of life, through inclusive outreach, fostering Youth (16 - 24) engagement in politics as a force for change. By expanding through voting initiatives, social gatherings, and direct interactions with policymakers, we bridge the gap between youth voices and political action. We seek to amplify this generation’s voice within the Natural State, ensuring their priorities and ideas drive the decisions that shape our worlds today’s and tomorrows.'

/** Phrases to emphasize visually — must match mission text exactly. */
export const AYC_MISSION_HIGHLIGHTS = [
  'young people from all walks of life',
  'Youth (16 - 24)',
  'force for change',
  'bridge the gap',
  'Natural State',
] as const

export const AYC_SITE_NAME = 'AYC Leadership Workbench'

export const AYC_PAGE_TITLE = 'Arkansas Youth Coalition | Leadership Workbench'

export const AYC_PAGE_DESCRIPTION =
  'The Arkansas Youth Coalition Leadership Workbench is a protected space for young Arkansans ages 16–24 building political engagement, statewide relationships, and youth-led action.'

export const TEAMS = [
  {
    id: 'organizer',
    name: 'Organizer',
    shortLabel: 'Build the network',
    description:
      'Build relationships, recruit members, develop local teams, and help people move from interest to action.',
    mark: '01',
  },
  {
    id: 'voter-registration',
    name: 'Voter Registration',
    shortLabel: 'Expand participation',
    description:
      'Help young Arkansans understand registration, overcome barriers, and become confident participants in elections.',
    mark: '02',
  },
  {
    id: 'social-media',
    name: 'Social Media',
    shortLabel: 'Shape the story',
    description:
      'Tell the story of the coalition, elevate youth voices, share opportunities, and make political engagement easier to understand.',
    mark: '03',
  },
  {
    id: 'events',
    name: 'Events',
    shortLabel: 'Create the experience',
    description:
      'Create social gatherings, leadership experiences, public conversations, trainings, and opportunities to engage policymakers.',
    mark: '04',
  },
  {
    id: 'outreach',
    name: 'Outreach',
    shortLabel: 'Open the door',
    description:
      'Build connections with schools, communities, organizations, and young people who have not yet found a place in political life.',
    mark: '05',
  },
] as const

export const HEARD_INSIGHTS = [
  {
    title: 'Young people want meaningful participation',
    body: 'Young Arkansans want more than occasional invitations to attend. They want real responsibility, real relationships, and real opportunities to shape the decisions affecting their lives.',
  },
  {
    title: 'Politics often feels distant',
    body: 'Many young people do not see a clear path from their concerns to the people making policy. AYC exists to help close that distance.',
  },
  {
    title: 'Community creates confidence',
    body: 'Political engagement becomes easier when young people have a trusted network, shared experiences, and leaders who help them take the next step.',
  },
  {
    title: 'Leadership must begin locally',
    body: 'The strongest statewide movement begins in schools, colleges, counties, neighborhoods, and relationships already rooted in local communities.',
  },
] as const

export const BUILDING_PILLARS = [
  {
    number: '01',
    title: 'A connected statewide network',
    body: 'AYC will connect young people across colleges, high schools, counties, and communities so they can learn from one another and act together.',
  },
  {
    number: '02',
    title: 'A path from interest to leadership',
    body: 'Members should be able to move from curiosity, to participation, to responsibility, to leading others.',
  },
  {
    number: '03',
    title: 'Direct access to political action',
    body: 'Voting initiatives, public events, community outreach, and interaction with policymakers will give young people clear ways to influence decisions.',
  },
  {
    number: '04',
    title: 'Durable youth infrastructure',
    body: 'The organization should remain strong as leaders graduate, move, change roles, and help prepare the next generation.',
  },
] as const

export const JOURNEY_STEPS = [
  {
    word: 'Listen',
    body: 'Begin with the priorities, experiences, and ideas young Arkansans bring from their own schools and communities.',
  },
  {
    word: 'Connect',
    body: 'Create relationships across geography, background, and experience so young people know they are not working alone.',
  },
  {
    word: 'Organize',
    body: 'Build teams around clear responsibilities, shared goals, and practical opportunities to contribute.',
  },
  {
    word: 'Act',
    body: 'Register voters, hold gatherings, conduct outreach, meet policymakers, and participate directly in civic and political life.',
  },
  {
    word: 'Lead',
    body: 'Help volunteers grow into organizers, team leads, and statewide leaders who can prepare others to follow.',
  },
] as const

export const BETA_LOOP = ['Build', 'Test', 'Listen', 'Improve', 'Expand'] as const
