// src/services/api.js

const API_BASE_URL = 'http://localhost:3000/api';

// Helper function to handle fetch responses and errors cleanly
const fetchWithHandler = async (url, options = {}) => {
  const response = await fetch(url, options);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.message || data.error || `HTTP error! status: ${response.status}`);
  }
  return data;
};

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
  getEvents: () => fetchWithHandler(`${API_BASE_URL}/events`),
  
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
  getAttendees: () => fetchWithHandler(`${API_BASE_URL}/dashboard/attendance`),

  addAttendee: (attendeeData) => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/attendance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attendeeData),
    });
  },

  updateAttendeeStatus: (id, status) => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/attendance/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  },

  updateAttendeeDetails: (id, attendeeData) => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/attendance/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(attendeeData),
    });
  },

  // ==========================================
  // 4. TOURNAMENT MANAGEMENT
  // ==========================================
  getTournaments: () => fetchWithHandler(`${API_BASE_URL}/dashboard/tournaments`),

  createTournament: (tournamentData) => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/tournaments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tournamentData),
    });
  },

  updateTournament: (id, tournamentData) => {
    return fetchWithHandler(`${API_BASE_URL}/dashboard/tournaments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(tournamentData),
    });
  },

  // ==========================================
  // 5. ASSETS (BROCHURES & MAPS)
  // ==========================================
  getBrochures: () => fetchWithHandler(`${API_BASE_URL}/dashboard/brochure`),
  
  getVenueMaps: () => fetchWithHandler(`${API_BASE_URL}/dashboard/venue-maps`),

  // ==========================================
  // 6. GUEST APP ENDPOINTS
  // ==========================================
  getGuestSchedule: () => fetchWithHandler(`${API_BASE_URL}/guest/schedule`),
  
  getGuestAnnouncements: () => fetchWithHandler(`${API_BASE_URL}/guest/announcements`),

  submitGuestFeedback: (feedbackData) => {
    return fetchWithHandler(`${API_BASE_URL}/guest/feedback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(feedbackData),
    });
  }
};