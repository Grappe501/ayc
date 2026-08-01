export type LocationMissionType = 'HIGH_SCHOOL' | 'COLLEGE' | 'COUNTY'

export type LocationTeamMissionPack = {
  locationType: LocationMissionType
  label: string
  charge: string
  purpose: string
  servesCoalition: string
  focusAreas: string[]
  leadOwns: string[]
  successLooksLike: string[]
}

/**
 * Location TEAM board mission — local charge by location type.
 * Does not rewrite the canonical AYC mission or copy statewide category packs.
 */
export const LOCATION_TEAM_MISSIONS: Record<LocationMissionType, LocationTeamMissionPack> = {
  HIGH_SCHOOL: {
    locationType: 'HIGH_SCHOOL',
    label: 'High school',
    charge: 'Build a trusted youth leadership circle at this school.',
    purpose:
      'The school TEAM board gathers every AYC person connected to this campus — students, leads, and supporters — so local work has a clear home.',
    servesCoalition:
      'Strong school teams give High School Lead Organizers real coverage and give statewide categories people who can carry work locally.',
    focusAreas: [
      'Know every active person at this school by name and contact',
      'Keep at least one clear local lead (or a develop-local-leads ask)',
      'Connect school energy to Organizer, Events, and Outreach asks',
      'Welcome prospectives and move them into a first role',
    ],
    leadOwns: [
      'Roster health and contact gaps for this school',
      'Which category boards need people here',
      'Hand-offs up to the High School segment board',
    ],
    successLooksLike: [
      'Contact gaps are closed or actively queued',
      'A named lead (or active develop path) exists',
      'Category boards at this school are not empty shells',
    ],
  },
  COLLEGE: {
    locationType: 'COLLEGE',
    label: 'College',
    charge: 'Make this campus a durable AYC organizing base.',
    purpose:
      'The campus TEAM board is the rollup for every member at this college — across majors, years, and category teams — so campus work stays coordinated.',
    servesCoalition:
      'College locations feed statewide categories with skilled volunteers and keep AYC visible where young Arkansans already gather.',
    focusAreas: [
      'Maintain a living campus roster with reliable contacts',
      'Surface category coverage gaps (Organizer, VR, Social, Events, Outreach)',
      'Turn join interest into placed roles quickly',
      'Keep calendar and people aligned for campus actions',
    ],
    leadOwns: [
      'Campus roster accuracy and gap fill',
      'Category board staffing asks',
      'Visibility back to Chance / category leads',
    ],
    successLooksLike: [
      'Active people have phone or email on file',
      'Prospectives are reviewed within a week',
      'At least one category board here has a clear next ask',
    ],
  },
  COUNTY: {
    locationType: 'COUNTY',
    label: 'County',
    charge: 'Organize working-class youth power in this county.',
    purpose:
      'The county TEAM board holds every AYC person tied to this place — so Working Class pathways have a real local home beyond statewide lists.',
    servesCoalition:
      'County teams keep AYC from being campus-only and give Outreach, Organizer, and Events people rooted in community life.',
    focusAreas: [
      'Know who is active in this county and how to reach them',
      'Develop local leads who can host and invite',
      'Link county energy to statewide category work',
      'Keep prospectives moving into concrete roles',
    ],
    leadOwns: [
      'County roster and contact gaps',
      'Develop-local-leads follow-through',
      'Hand-offs to the Working Class segment board',
    ],
    successLooksLike: [
      'Contact gaps shrink week over week',
      'A local lead path is named and supported',
      'County people show up on category boards with clear asks',
    ],
  },
}

export function getLocationTeamMission(locationType: string): LocationTeamMissionPack {
  if (locationType === 'HIGH_SCHOOL' || locationType === 'COLLEGE' || locationType === 'COUNTY') {
    return LOCATION_TEAM_MISSIONS[locationType]
  }
  // Fallback — treat unknown as college-style campus language
  return LOCATION_TEAM_MISSIONS.COLLEGE
}
