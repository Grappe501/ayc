/**
 * AYC leadership roster for Leader Board seed.
 * Attendance from intake notes is recorded here for future events work — not persisted in Phase 1.
 */

export type RosterTeamRef = {
  slug: 'organizer' | 'voter-registration' | 'social-media' | 'events' | 'outreach'
  position: 'LEAD' | 'VOLUNTEER'
  primary?: boolean
}

export type RosterPerson = {
  firstName: string
  lastName: string
  preferredName?: string
  locationName: string
  locationType: 'COLLEGE' | 'HIGH_SCHOOL' | 'COUNTY'
  locationCode: string
  teams: RosterTeamRef[]
  status?: 'ACTIVE' | 'PROSPECTIVE'
  /** Intake attendance notes only — not stored in Phase 1 DB */
  attendanceNote?: string
}

function loc(
  name: string,
  type: RosterPerson['locationType'],
  code: string,
): Pick<RosterPerson, 'locationName' | 'locationType' | 'locationCode'> {
  return { locationName: name, locationType: type, locationCode: code }
}

const ORG = (position: 'LEAD' | 'VOLUNTEER', primary = true): RosterTeamRef => ({
  slug: 'organizer',
  position,
  primary,
})
const VRE = (position: 'LEAD' | 'VOLUNTEER', primary = true): RosterTeamRef => ({
  slug: 'voter-registration',
  position,
  primary,
})
const SOC = (position: 'LEAD' | 'VOLUNTEER', primary = true): RosterTeamRef => ({
  slug: 'social-media',
  position,
  primary,
})
const EVT = (position: 'LEAD' | 'VOLUNTEER', primary = true): RosterTeamRef => ({
  slug: 'events',
  position,
  primary,
})
const OUT = (position: 'LEAD' | 'VOLUNTEER', primary = true): RosterTeamRef => ({
  slug: 'outreach',
  position,
  primary,
})

/** Board operator / statewide organizer */
export const CHANCE_BRADFORD: RosterPerson = {
  firstName: 'Chance',
  lastName: 'Bradford',
  ...loc('Arkansas Youth Coalition', 'COUNTY', 'AYC'),
  teams: [ORG('LEAD'), OUT('VOLUNTEER', false)],
  status: 'ACTIVE',
  attendanceNote: 'Leader Board operator — statewide coordination',
}

export const LEADERSHIP_ROSTER: RosterPerson[] = [
  CHANCE_BRADFORD,
  {
    firstName: 'Javion',
    lastName: 'Dotson',
    ...loc('Maumelle High School', 'HIGH_SCHOOL', 'MAU'),
    teams: [ORG('LEAD'), VRE('VOLUNTEER', false)],
    attendanceNote: 'M1 absent, M2 absent',
  },
  {
    firstName: 'Joey',
    lastName: 'Traylor',
    ...loc('Not Specified', 'COUNTY', 'NSP'),
    teams: [ORG('LEAD'), SOC('VOLUNTEER', false)],
    attendanceNote: 'M1 absent, M2 absent',
  },
  {
    firstName: 'Neil',
    lastName: 'Dogra',
    ...loc('Hendrix College', 'COLLEGE', 'HEN'),
    teams: [ORG('LEAD')],
    attendanceNote: 'M1 present, M2 present — College Lead',
  },
  {
    firstName: 'Keithan',
    lastName: 'Smith',
    ...loc('University of Arkansas, Fayetteville', 'COLLEGE', 'UAF'),
    teams: [ORG('LEAD')],
    attendanceNote: 'M1 present, M2 present — College Lead',
  },
  {
    firstName: 'John',
    lastName: 'Skaggs',
    ...loc('Truman High School', 'HIGH_SCHOOL', 'TRU'),
    teams: [ORG('LEAD')],
    attendanceNote: 'M1 absent, M2 present — Campus Lead',
  },
  {
    firstName: 'Maverick',
    lastName: 'Merryman',
    ...loc('Valley View High School', 'HIGH_SCHOOL', 'VVH'),
    teams: [ORG('LEAD')],
    attendanceNote: 'M1 present, M2 present — Campus Lead',
  },
  {
    firstName: 'Marlena',
    lastName: 'Beard',
    ...loc('Arkansas State University', 'COLLEGE', 'ASU'),
    teams: [ORG('LEAD'), OUT('VOLUNTEER', false)],
    attendanceNote: 'M1 present, M2 present — College Lead',
  },
  {
    firstName: 'Hayden',
    lastName: 'Mittlestat',
    ...loc('University of Arkansas, Fayetteville', 'COLLEGE', 'UAF'),
    teams: [OUT('LEAD')],
    attendanceNote: 'M1 present, M2 present',
  },
  {
    firstName: 'Danny',
    lastName: 'Bagley',
    ...loc('Not Specified', 'COUNTY', 'NSP'),
    teams: [OUT('LEAD')],
    attendanceNote: 'M1 absent, M2 present',
  },
  {
    firstName: 'Daniel',
    lastName: 'Lee',
    ...loc('Valley View High School', 'HIGH_SCHOOL', 'VVH'),
    teams: [OUT('LEAD')],
    attendanceNote: 'M1 absent, M2 present',
  },
  {
    firstName: 'Mikey',
    lastName: 'Quessadeau',
    ...loc('Henderson State University', 'COLLEGE', 'HSU'),
    teams: [OUT('VOLUNTEER')],
    attendanceNote: 'M1 present, M2 absent',
  },
  {
    firstName: 'Alyson',
    lastName: 'Tinsley',
    ...loc('University of Central Arkansas', 'COLLEGE', 'UCA'),
    teams: [OUT('VOLUNTEER')],
    attendanceNote: 'M1 present, M2 absent',
  },
  {
    firstName: 'Xeno',
    lastName: 'Jones',
    ...loc('Philander Smith University', 'COLLEGE', 'PSU'),
    teams: [OUT('LEAD'), VRE('VOLUNTEER', false)],
    attendanceNote: 'M1 present, M2 absent',
  },
  {
    firstName: 'Shaniya',
    lastName: 'Unknown',
    preferredName: 'Shaniya',
    ...loc('Philander Smith University', 'COLLEGE', 'PSU'),
    teams: [VRE('LEAD'), OUT('VOLUNTEER', false)],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent — last name TBD',
  },
  {
    firstName: 'Madison',
    lastName: 'Harneck',
    ...loc('University of Central Arkansas', 'COLLEGE', 'UCA'),
    teams: [VRE('LEAD'), OUT('VOLUNTEER', false)],
    attendanceNote: 'M1 present, M2 present',
  },
  {
    firstName: 'Connor',
    lastName: 'Boyd',
    ...loc('Harmony Grove High School', 'HIGH_SCHOOL', 'HGH'),
    teams: [VRE('LEAD')],
    attendanceNote: 'M1 absent, M2 present — Saline County',
  },
  {
    firstName: 'Will',
    lastName: 'Humiston',
    ...loc('Hendrix College', 'COLLEGE', 'HEN'),
    teams: [EVT('VOLUNTEER')],
    attendanceNote: 'M1 absent, M2 present',
  },
  {
    firstName: 'Zavian',
    lastName: 'Collins',
    ...loc('Arkansas State University', 'COLLEGE', 'ASU'),
    teams: [EVT('VOLUNTEER')],
    attendanceNote: 'M1 present, M2 absent — Jonesboro',
  },
  {
    firstName: 'Miguel',
    lastName: 'Ruiz',
    ...loc('Jacksonville High School', 'HIGH_SCHOOL', 'JAX'),
    teams: [EVT('LEAD')],
    attendanceNote: 'M1 absent, M2 present',
  },
  {
    firstName: 'Aarya',
    lastName: 'Patel',
    ...loc('University of Arkansas, Fayetteville', 'COLLEGE', 'UAF'),
    teams: [EVT('LEAD')],
    attendanceNote: 'M1 present, M2 absent',
  },
  {
    firstName: 'Landon',
    lastName: 'Newcom',
    ...loc('Highland High School', 'HIGH_SCHOOL', 'HLD'),
    teams: [EVT('LEAD')],
    attendanceNote: 'M1 absent, M2 absent — Sharp County',
  },
  {
    firstName: 'Bethany',
    lastName: 'Ledwaba',
    ...loc('University of Central Arkansas', 'COLLEGE', 'UCA'),
    teams: [SOC('LEAD')],
    attendanceNote: 'M1 absent, M2 present',
  },
  {
    firstName: "Ma'Hogani",
    lastName: 'Trotter',
    ...loc('Arkansas State University', 'COLLEGE', 'ASU'),
    teams: [SOC('LEAD')],
    attendanceNote: 'M1 absent, M2 present — Jonesboro',
  },
  {
    firstName: 'David',
    lastName: 'Webster',
    ...loc('Arkansas Christian High School', 'HIGH_SCHOOL', 'ACH'),
    teams: [SOC('LEAD')],
    attendanceNote: 'M1 absent, M2 present',
  },
  {
    firstName: 'Carrah',
    lastName: 'Unknown',
    preferredName: 'Carrah',
    ...loc('Harmony Grove High School', 'HIGH_SCHOOL', 'HGH'),
    teams: [SOC('LEAD')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent — last name TBD',
  },
  {
    firstName: 'Tyson',
    lastName: 'Thompson',
    ...loc('University of Arkansas at Pine Bluff', 'COLLEGE', 'UAPB'),
    teams: [SOC('LEAD')],
    attendanceNote: 'M1 present, M2 absent',
  },
  {
    firstName: 'Brandon',
    lastName: 'Ellis',
    ...loc('Henderson State University', 'COLLEGE', 'HSU'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 present, M2 present — also teaching in Cabot; team TBD',
  },
  {
    firstName: 'Kanara',
    lastName: 'Unknown',
    preferredName: 'Kanara',
    ...loc('Pulaski Technical College', 'COLLEGE', 'PTC'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 present, M2 absent — team TBD',
  },
  {
    firstName: 'Eli',
    lastName: 'Dolinger',
    ...loc('University of Arkansas at Little Rock', 'COLLEGE', 'UALR'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 present, M2 absent — team TBD',
  },
  {
    firstName: 'Hollon',
    lastName: 'Glaze',
    ...loc('Rose-Hulman Institute of Technology', 'COLLEGE', 'RHI'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 present, M2 absent — team TBD',
  },
  {
    firstName: 'Ben',
    lastName: 'Ostrander',
    ...loc('Fort Smith Southside High School', 'HIGH_SCHOOL', 'FSS'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 present, M2 absent — team TBD',
  },
  {
    firstName: 'Anthony',
    lastName: 'Vilonia',
    preferredName: 'Anthony',
    ...loc('Vilonia High School', 'HIGH_SCHOOL', 'VIL'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 present, M2 absent — last name TBD',
  },
  {
    firstName: 'Morgan',
    lastName: 'Unknown',
    preferredName: 'Morgan',
    ...loc('Philander Smith University', 'COLLEGE', 'PSU'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 present, M2 absent — team TBD',
  },
  {
    firstName: 'Karen',
    lastName: 'Allen Grimes',
    ...loc('University of Arkansas at Little Rock', 'COLLEGE', 'UALR'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 present — team TBD',
  },
  {
    firstName: 'Alex',
    lastName: 'Sims',
    ...loc('University of Arkansas, Fayetteville', 'COLLEGE', 'UAF'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent — team TBD',
  },
  {
    firstName: 'Chance',
    lastName: 'Simmons',
    ...loc('University of Arkansas at Pine Bluff', 'COLLEGE', 'UAPB'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent — team TBD',
  },
  {
    firstName: 'Chantlor',
    lastName: 'Dorsey',
    ...loc('Not Specified', 'COUNTY', 'NSP'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent',
  },
  {
    firstName: 'Reese',
    lastName: 'Unknown',
    preferredName: 'Reese',
    ...loc('Not Specified', 'COUNTY', 'NSP'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent',
  },
  {
    firstName: 'Kaleb',
    lastName: 'James',
    ...loc('Not Specified', 'COUNTY', 'NSP'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent',
  },
  {
    firstName: 'Jolie',
    lastName: 'Dover',
    ...loc('Not Specified', 'COUNTY', 'NSP'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent',
  },
  {
    firstName: 'Joe',
    lastName: 'Prophet',
    preferredName: 'Joe da Prophet',
    ...loc('Not Specified', 'COUNTY', 'NSP'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent',
  },
  {
    firstName: 'AJ',
    lastName: 'PB',
    preferredName: 'AJ from PB',
    ...loc('Not Specified', 'COUNTY', 'NSP'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent',
  },
  {
    firstName: 'KT',
    lastName: 'Tose',
    ...loc('Not Specified', 'COUNTY', 'NSP'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent',
  },
  {
    firstName: 'John',
    lastName: 'Thompson',
    ...loc('Not Specified', 'COUNTY', 'NSP'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent',
  },
  {
    firstName: 'Beau',
    lastName: 'Reagan',
    ...loc('Not Specified', 'COUNTY', 'NSP'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent',
  },
  {
    firstName: 'Luke',
    lastName: 'Jones',
    ...loc('Not Specified', 'COUNTY', 'NSP'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent',
  },
  {
    firstName: 'John',
    lastName: 'Launius',
    ...loc('Not Specified', 'COUNTY', 'NSP'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent',
  },
  {
    firstName: 'Tayshaun',
    lastName: 'Childs',
    ...loc('Not Specified', 'COUNTY', 'NSP'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent',
  },
  {
    firstName: 'Jack',
    lastName: 'Kirtley',
    ...loc('Not Specified', 'COUNTY', 'NSP'),
    teams: [ORG('VOLUNTEER')],
    status: 'PROSPECTIVE',
    attendanceNote: 'M1 absent, M2 absent',
  },
]
