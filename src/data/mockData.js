// Centralized mock data layer to simulate backend database until API is ready.

// Host Attendance Mock Data
export const hostAttendees = [
  { id: 'P-001', name: 'Alice Johnson', email: 'alice@email.com', status: 'Checked In', time: '10:15 AM', type: 'VIP Pass', source: 'Website' },
  { id: 'P-002', name: 'Bob Smith', email: 'bob@email.com', status: 'Checked In', time: '10:22 AM', type: 'Standard', source: 'App' },
  { id: 'P-003', name: 'Carol Williams', email: 'carol@email.com', status: 'Absent', time: '-', type: 'Standard', source: 'Website' },
  { id: 'P-004', name: 'David Brown', email: 'david@email.com', status: 'Absent', time: '-', type: 'VIP Pass', source: 'Sponsor' },
  { id: 'P-005', name: 'Eva Davis', email: 'eva@email.com', status: 'Absent', time: '-', type: 'Standard', source: 'Website' }
];

export const initialTournaments = [
  {
    id: 1,
    name: 'Tech Summit Championship',
    status: 'Live',
    format: 'bracket',
    participants: ['Team Alpha', 'Team Beta', 'Cyber Ninjas', 'Neon Phantoms'],
    matches: {
      q1: { t1: 'Team Alpha', s1: 2, t2: 'Team Beta', s2: 0 },
      q2: { t1: 'Cyber Ninjas', s1: 1, t2: 'Neon Phantoms', s2: 2 },
      s1: { t1: 'Team Alpha', s1: 3, t2: 'Neon Phantoms', s2: 1 },
      f1: { t1: 'Team Alpha', s1: '-', t2: 'TBD', s2: '-' }
    }
  },
  {
    id: 2,
    name: 'Esports Spring Cup',
    status: 'Upcoming',
    format: 'bracket',
    participants: ['Lions', 'Tigers', 'Bears', 'Wolves'],
    matches: {
      q1: { t1: 'Lions', s1: '-', t2: 'Tigers', s2: '-' },
      q2: { t1: 'Bears', s1: '-', t2: 'Wolves', s2: '-' },
      s1: { t1: 'TBD', s1: '-', t2: 'TBD', s2: '-' },
      f1: { t1: 'TBD', s1: '-', t2: 'TBD', s2: '-' }
    }
  }
];

export const initialFiles = [
  {
    id: 1,
    name: 'Tech_Summit_2026_Schedule.pdf',
    size: 2450000, 
    type: 'application/pdf',
    url: '#',
    info: 'The complete timeline of events and keynote speakers for the 3-day summit.'
  },
  {
    id: 2,
    name: 'Venue_Map_and_Parking.png',
    size: 4800000,
    type: 'image/png',
    url: 'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&q=80&w=800',
    info: 'High-resolution map of the conference center and surrounding parking facilities.'
  },
  {
    id: 3,
    name: 'Speaker_Biographies.docx',
    size: 1200000,
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    url: '#',
    info: 'Detailed background information for all panel members and keynote speakers.'
  }
];

export const initialMaps = [
  {
    id: 1,
    name: 'Main Floor',
    image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&q=80&w=1000',
    zones: [
      { id: 1, name: 'Main Stage', color: '#3b82f6', x: 35, y: 30 },
      { id: 2, name: 'Food Court', color: '#f59e0b', x: 70, y: 75 },
      { id: 3, name: 'Exhibition Hall A', color: '#10b981', x: 65, y: 40 }
    ],
    activeZoneId: null
  }
];

export const hostEvents = [
  {
    id: 'e_101',
    title: 'Tech Summit 2026',
    dateRange: 'Feb 25 - Feb 27, 2026',
    location: 'Convention Center',
    participantsCount: hostAttendees.length,
    status: 'Active',
    metrics: {
      attendance: hostAttendees.filter(a => a.status === 'Checked In').length,
      tournament: initialTournaments.reduce((acc, t) => acc + t.participants.length, 0),
      brochure: initialFiles.length,
      map: initialMaps.reduce((acc, m) => acc + m.zones.length, 0)
    }
  },
  {
    id: 'e_102',
    title: 'Design Conference',
    dateRange: 'Mar 5, 2026',
    participantsCount: 280,
    status: 'Upcoming'
  },
  {
    id: 'e_103',
    title: 'Startup Pitch Night',
    dateRange: 'Mar 12, 2026',
    participantsCount: 150,
    status: 'Upcoming'
  },
  {
    id: 'e_104',
    title: 'AI Workshop Series',
    dateRange: 'Feb 20, 2026',
    participantsCount: 120,
    status: 'Completed'
  },
  {
    id: 'e_105',
    title: 'Gaming Tournament',
    dateRange: 'Feb 15, 2026',
    participantsCount: 320,
    status: 'Completed'
  },
  {
    id: 'e_106',
    title: 'Music Festival',
    dateRange: 'Mar 20, 2026',
    participantsCount: 800,
    status: 'Upcoming'
  }
];

export const hostRecentActivity = [
  {
    id: 'a_1',
    icon: 'user-check', 
    text: `${hostAttendees.filter(a => a.status === 'Checked In').length} participants successfully checked in`,
    time: 'Just now',
    color: 'success'
  },
  {
    id: 'a_2',
    icon: 'trophy',
    text: `${initialTournaments.length} active tournaments scheduled`,
    time: '2 hours ago',
    color: 'warning'
  },
  {
    id: 'a_3',
    icon: 'users',
    text: `${hostAttendees.length} total participants registered`,
    time: 'yesterday',
    color: 'primary'
  },
  {
    id: 'a_4',
    icon: 'book-open',
    text: `${initialFiles.length} digital brochures currently live`,
    time: 'yesterday',
    color: 'info'
  }
];

// Guest Mock Data
export const guestAnnouncements = [
  {
    id: 'ann_1',
    message: 'Keynote starts in 30 minutes',
    time: '10:30 AM',
    isUrgent: true
  },
  {
    id: 'ann_2',
    message: 'Lunch break at Food Court',
    time: '12:00 PM',
    isUrgent: false
  },
  {
    id: 'ann_3',
    message: 'Workshop registration open',
    time: '2:00 PM',
    isUrgent: false
  }
];

export const guestSchedule = [
  {
    id: 'sch_1',
    time: '09:00',
    title: 'Registration & Check-in',
    location: 'Main Entrance',
    status: 'completed'
  },
  {
    id: 'sch_2',
    time: '10:00',
    title: 'Opening Ceremony',
    location: 'Main Stage',
    status: 'active'
  },
  {
    id: 'sch_3',
    time: '11:00',
    title: 'Keynote: Future of AI',
    location: 'Main Stage',
    status: 'upcoming'
  },
  {
    id: 'sch_4',
    time: '12:00',
    title: 'Lunch Break',
    location: 'Food Court',
    status: 'upcoming'
  },
  {
    id: 'sch_5',
    time: '14:00',
    title: 'Workshop: React Masterclass',
    location: 'Workshop Room',
    status: 'upcoming'
  },
  {
    id: 'sch_6',
    time: '16:00',
    title: 'Tournament Quarter Finals',
    location: 'Exhibition Hall A',
    status: 'upcoming'
  }
];

export const guestTournamentData = {
  liveMatch: {
    team1: { name: 'Gamma', icon: 'G', score: 2 },
    team2: { name: 'Delta', icon: 'D', score: 2 },
    round: 'Quarter Final 2'
  },
  standings: [
    { rank: 1, name: 'Team Alpha', w: 5, l: 0, pts: 150 },
    { rank: 2, name: 'Team Gamma', w: 4, l: 1, pts: 120 },
    { rank: 3, name: 'Team Epsilon', w: 3, l: 2, pts: 90 },
    { rank: 4, name: 'Team Beta', w: 2, l: 3, pts: 60 }
  ]
};
