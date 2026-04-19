// src/services/api.js

const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const API_BASE_URL = isLocal 
  ? 'http://localhost:3000/api' 
  : 'https://api.eventflow.hamstersame.org/api';

// Helper function to handle fetch responses and errors cleanly
const fetchWithHandler = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
  }
  return data;
};

const mapAttendeeFromApi = (row) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  status: row.status || 'Absent',
  time: row.check_in_time || '-',
  type: row.ticket_type || 'Standard',
  source: row.registration_source || 'Website',
});

const mapAttendeeToApi = (row, eventId = 'e_001') => ({
  id: row.id,
  event_id: eventId,
  name: row.name,
  email: row.email,
  status: row.status,
  ticket_type: row.type,
  registration_source: row.source,
  check_in_time: row.time && row.time !== '-' ? row.time : null,
});

const mapBrochureFromApi = (row) => ({
  id: row.id,
  name: row.file_name,
  size: row.size_bytes || 0,
  type: row.file_type || '',
  url: row.file_url,
  info: row.description || '',
});

const withEventScopedId = (rawId, eventId, prefix) => {
  const id = String(rawId || '').trim();
  if (!id) return `${eventId}_${prefix}_${Date.now()}`;
  if (id.startsWith(`${eventId}_`)) return id;
  return `${eventId}_${prefix}_${id}`;
};

const mapBrochureToApi = (row, eventId = 'e_001') => ({
  id: withEventScopedId(row.id, eventId, 'brochure'),
  event_id: eventId,
  file_name: row.name,
  file_type: row.type,
  file_url: row.url,
  description: row.info || '',
  size_bytes: row.size || 0,
});

const mapVenueFromApi = (row) => ({
  id: String(row.id),
  name: row.name,
  image: row.image_url,
  zones: Array.isArray(row.zones) ? row.zones : [],
  activeZoneId: null,
});

const mapVenueToApi = (row, eventId = 'e_001') => ({
  id: withEventScopedId(row.id, eventId, 'map'),
  event_id: eventId,
  name: row.name,
  image_url: row.image,
  zones: row.zones || [],
});

const mapAnnouncementFromApi = (row) => ({
  id: row.id,
  message: row.message,
  time: row.posted_time || '',
  isUrgent: Boolean(row.is_urgent),
});

const mapAnnouncementToApi = (row, eventId = 'e_001') => ({
  id: withEventScopedId(row.id, eventId, 'announcement'),
  event_id: eventId,
  message: row.message,
  is_urgent: Boolean(row.isUrgent),
});

export const api = {
  
  // ==========================================
  // 1. AUTHENTICATION
  // ==========================================
  login: (email, password) => {
    return fetchWithHandler(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
  },

  register: (name, email, password) => {
    return fetchWithHandler(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
  },

  // ==========================================
  // 2. EVENTS & DASHBOARD SETTINGS
  // ==========================================
  getEvents: async () => {
    const rows = await fetchWithHandler(`${API_BASE_URL}/events`);
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      dateRange: row.date_range,
      location: row.location,
      status: row.status,
    }));
  },

  createEvent: (eventData) => {
    return fetchWithHandler(`${API_BASE_URL}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: eventData.id,
        title: eventData.title,
        date_range: eventData.dateRange,
        location: eventData.location,
        status: eventData.status,
      }),
    });
  },

  updateEvent: (eventId, updateData) => {
    return fetchWithHandler(`${API_BASE_URL}/events/${encodeURIComponent(eventId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
  },

  deleteEvent: (eventId) => {
    return fetchWithHandler(`${API_BASE_URL}/events/${encodeURIComponent(eventId)}`, {
      method: 'DELETE',
    });
  },
  
  getCustomization: () => fetchWithHandler(`${API_BASE_URL}/dashboard/customize`),

  updateCustomization: (customizationData) => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/customize`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(customizationData),
    });
  },

  // NEW: Added the uploadImage function for Multer
  uploadImage: async (imageFile) => {
    const formData = new FormData();
    formData.append('file', imageFile);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData, // The browser automatically sets the correct Multipart headers for files
    });
    
    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.error || 'Image upload failed');
    }
    return response.json(); 
  },
  
  getFeedbackFormConfig: () => fetchWithHandler(`${API_BASE_URL}/dashboard/feedback-form`),

  getActivityLogs: () => fetchWithHandler(`${API_BASE_URL}/dashboard/activity`),

  // ==========================================
  // 3. ATTENDANCE MANAGEMENT
  // ==========================================
  getAttendees: async (eventId = 'e_001') => {
    const rows = await fetchWithHandler(`${API_BASE_URL}/dashboard/attendance?event_id=${encodeURIComponent(eventId)}`);
    return rows.map(mapAttendeeFromApi);
  },

  addAttendee: (attendeeData, eventId = 'e_001') => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapAttendeeToApi(attendeeData, eventId)),
    });
  },

  updateAttendeeStatus: (id, status, eventId = 'e_001') => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/attendance/${id}?event_id=${encodeURIComponent(eventId)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, event_id: eventId }),
    });
  },

  updateAttendeeDetails: (id, attendeeData, eventId = 'e_001') => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/attendance/${id}?event_id=${encodeURIComponent(eventId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(mapAttendeeToApi(attendeeData, eventId)),
    });
  },

  // ==========================================
  // 4. TOURNAMENT MANAGEMENT
  // ==========================================
  getTournaments: (eventId = 'e_001') => fetchWithHandler(`${API_BASE_URL}/dashboard/tournaments?event_id=${encodeURIComponent(eventId)}`),

  createTournament: (tournamentData, eventId = 'e_001') => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/tournaments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...tournamentData, event_id: eventId }),
    });
  },

  updateTournament: (id, tournamentData, eventId = 'e_001') => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/tournaments/${id}?event_id=${encodeURIComponent(eventId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...tournamentData, event_id: eventId }),
    });
  },

  // ==========================================
  // 4A. EVENT SCHEDULES
  // ==========================================
  getSchedules: (eventId = 'e_001') => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/schedules?event_id=${encodeURIComponent(eventId)}`);
  },

  createSchedule: (scheduleData, eventId = 'e_001') => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/schedules`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...scheduleData, event_id: eventId }),
    });
  },

  updateSchedule: (id, scheduleData, eventId = 'e_001') => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/schedules/${encodeURIComponent(id)}?event_id=${encodeURIComponent(eventId)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...scheduleData, event_id: eventId }),
    });
  },

  deleteSchedule: (id, eventId = 'e_001') => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/schedules/${encodeURIComponent(id)}?event_id=${encodeURIComponent(eventId)}`, {
      method: 'DELETE',
    });
  },

  // ==========================================
  // 5. ASSETS (BROCHURES & MAPS)
  // ==========================================
  getBrochures: async (eventId = 'e_001') => {
    const rows = await fetchWithHandler(`${API_BASE_URL}/dashboard/brochure?event_id=${encodeURIComponent(eventId)}`);
    return rows.map(mapBrochureFromApi);
  },

  replaceBrochures: (files, eventId = 'e_001') => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/brochure/replace`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: eventId,
        brochures: files.map(f => mapBrochureToApi(f, eventId)),
      }),
    });
  },

  getVenueMaps: async (eventId = 'e_001') => {
    const rows = await fetchWithHandler(`${API_BASE_URL}/dashboard/venue-maps?event_id=${encodeURIComponent(eventId)}`);
    return rows.map(mapVenueFromApi);
  },

  replaceVenueMaps: (maps, eventId = 'e_001') => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/venue-maps/replace`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: eventId,
        maps: maps.map(m => mapVenueToApi(m, eventId)),
      }),
    });
  },

  getDashboardAnnouncements: async (eventId = 'e_001') => {
    const rows = await fetchWithHandler(`${API_BASE_URL}/dashboard/announcements?event_id=${encodeURIComponent(eventId)}`);
    return rows.map(mapAnnouncementFromApi);
  },

  replaceDashboardAnnouncements: (announcements, eventId = 'e_001') => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/announcements/replace`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event_id: eventId,
        announcements: announcements.map(a => mapAnnouncementToApi(a, eventId)),
      }),
    });
  },

  // ==========================================
  // 6. GUEST APP ENDPOINTS
  // ==========================================
  getGuestSchedule: async () => {
    const rows = await fetchWithHandler(`${API_BASE_URL}/guest/schedule`);
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      location: row.location,
      time: row.session_time
        ? new Date(row.session_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })
        : '--:--',
      status: row.status || 'upcoming',
    }));
  },

  getGuestAnnouncements: async () => {
    const rows = await fetchWithHandler(`${API_BASE_URL}/guest/announcements`);
    return rows.map(mapAnnouncementFromApi);
  },

  getGuestBrochures: async () => {
    const rows = await fetchWithHandler(`${API_BASE_URL}/guest/brochure`);
    return rows.map(mapBrochureFromApi);
  },

  getGuestVenueMaps: async () => {
    const rows = await fetchWithHandler(`${API_BASE_URL}/guest/venue-maps`);
    return rows.map(mapVenueFromApi);
  },

  getGuestTournaments: () => fetchWithHandler(`${API_BASE_URL}/guest/tournaments`),

  submitGuestFeedback: (feedbackData) => {
    return fetchWithHandler(`${API_BASE_URL}/guest/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    });
  },

  // ==========================================
  // 7. ACTIVITY FEED
  // ==========================================
  getActivityFeed: async (eventId = 'e_001') => {
    try {
      const rows = await fetchWithHandler(`${API_BASE_URL}/dashboard/activity?event_id=${encodeURIComponent(eventId)}`);
      return rows;
    } catch (error) {
      console.error('Failed to get activity feed:', error);
      return [];
    }
  },

  // ==========================================
  // 8. GUEST CONTEXT
  // ==========================================
  getSelectedEventForGuests: async () => {
    try {
      const data = await fetchWithHandler(`${API_BASE_URL}/events/current-for-guests`);
      return data;
    } catch (error) {
      console.error('Failed to get selected event for guests:', error);
      return { event_id: 'e_001' };
    }
  },

  setSelectedEventForGuests: (eventId) => {
    return fetchWithHandler(`${API_BASE_URL}/events/current-for-guests`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ event_id: eventId }),
    });
  },
};