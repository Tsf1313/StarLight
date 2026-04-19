import React, { useEffect, useState } from 'react';
import { Users, BookOpen, Map, TrendingUp, Calendar, Plus, XCircle } from 'lucide-react';
import { hostEvents, hostRecentActivity } from '../../data/mockData';
import { api } from '../../services/api';
import { useEventContext } from '../../contexts/EventContext';

export default function DashboardOverview() {
  const { selectedEventId, setSelectedEventId, showToGuestsEventId, setShowToGuestsEventId } = useEventContext();
  const [eventsList, setEventsList] = useState(hostEvents);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [openEventMenu, setOpenEventMenu] = useState(null); // Track which event menu is open
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [scheduleEventId, setScheduleEventId] = useState(null);
  const [activityFeed, setActivityFeed] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [editingScheduleId, setEditingScheduleId] = useState(null);
  const [scheduleForm, setScheduleForm] = useState({ title: '', location: '', session_time: '', status: 'upcoming' });
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  
  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    dateRange: '',
    location: '',
    status: 'Upcoming'
  });

  const currentEvent = eventsList.find((e) => e.id === selectedEventId) || eventsList[0] || null;

   useEffect(() => {
    const loadEvents = async () => {
      try {
        const dbEvents = await api.getEvents();
        if (dbEvents.length > 0) {
          const merged = dbEvents.map((ev) => ({
            ...ev,
            metrics: {
              attendance: 0,
              tournament: 0,
              brochure: 0,
              map: 0,
            },
          }));
          setEventsList(merged);
          // Set selected event from context, fallback to first event
          if (!selectedEventId) {
            setSelectedEventId(merged[0].id);
          }
        }
      } catch (error) {
        console.error('Failed to load events:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadEvents();
  }, []);

  useEffect(() => {
    const loadGuestEvent = async () => {
      try {
        const guestEvent = await api.getSelectedEventForGuests();
        if (guestEvent?.event_id) {
          setShowToGuestsEventId(guestEvent.event_id);
        }
      } catch (error) {
        console.error('Failed to load current guest event:', error);
      }
    };

    loadGuestEvent();
  }, []);

  // Load activity feed when selected event changes
  useEffect(() => {
    const loadActivityFeed = async () => {
      try {
        const activity = await api.getActivityFeed(selectedEventId);
        if (activity && activity.length > 0) {
          setActivityFeed(activity.map((item) => ({
            id: item.id,
            text: item.text || item.action_text || 'Recent update',
            time: item.time || (item.created_at ? new Date(item.created_at).toLocaleString() : 'just now'),
            color: item.color || item.color_theme || 'primary',
          })));
        } else {
          setActivityFeed([]);
        }
      } catch (error) {
        console.error('Failed to load activity feed:', error);
        setActivityFeed([]);
      }
    };

    if (selectedEventId) {
      loadActivityFeed();
    }
  }, [selectedEventId]);

  const loadSchedules = async (eventId) => {
    try {
      const rows = await api.getSchedules(eventId);
      setSchedules(rows);
    } catch (error) {
      console.error('Failed to load schedules:', error);
      setSchedules([]);
    }
  };

  const formatScheduleTime = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    const hh = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
  };

  const openScheduleModal = async (eventId) => {
    setScheduleEventId(eventId);
    setScheduleForm({ title: '', location: '', session_time: '', status: 'upcoming' });
    setEditingScheduleId(null);
    await loadSchedules(eventId);
    setIsScheduleModalOpen(true);
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleEventId) return;

    const payload = {
      id: editingScheduleId || `sc_${Date.now()}`,
      title: scheduleForm.title,
      location: scheduleForm.location,
      session_time: scheduleForm.session_time,
      status: scheduleForm.status,
    };

    try {
      if (editingScheduleId) {
        await api.updateSchedule(editingScheduleId, payload, scheduleEventId);
      } else {
        await api.createSchedule(payload, scheduleEventId);
      }
      await loadSchedules(scheduleEventId);
      setScheduleForm({ title: '', location: '', session_time: '', status: 'upcoming' });
      setEditingScheduleId(null);
    } catch (error) {
      alert('Failed to save schedule: ' + error.message);
    }
  };

  const handleEditSchedule = (item) => {
    setEditingScheduleId(item.id);
    setScheduleForm({
      title: item.title || '',
      location: item.location || '',
      session_time: formatScheduleTime(item.session_time),
      status: item.status || 'upcoming',
    });
  };

  const handleDeleteSchedule = async (id) => {
    if (!scheduleEventId) return;
    if (!window.confirm('Delete this schedule item?')) return;
    try {
      await api.deleteSchedule(id, scheduleEventId);
      await loadSchedules(scheduleEventId);
      if (editingScheduleId === id) {
        setEditingScheduleId(null);
        setScheduleForm({ title: '', location: '', session_time: '', status: 'upcoming' });
      }
    } catch (error) {
      alert('Failed to delete schedule: ' + error.message);
    }
  };

  const handleShowToGuests = async (eventId) => {
    try {
      await api.setSelectedEventForGuests(eventId);
      setShowToGuestsEventId(eventId);
      alert('Guest app is now showing this event.');
    } catch (error) {
      alert('Failed to update guest event: ' + error.message);
    }
  };

  const handleDeleteEvent = async (eventId, eventTitle) => {
    const confirmFirst = window.confirm(`Delete event "${eventTitle}"? This removes all related data.`);
    if (!confirmFirst) return;
    const confirmSecond = window.confirm('Final confirmation: this cannot be undone. Delete now?');
    if (!confirmSecond) return;

    try {
      await api.deleteEvent(eventId);
      const remaining = eventsList.filter((ev) => ev.id !== eventId);
      setEventsList(remaining);

      if (selectedEventId === eventId) {
        const fallbackId = remaining[0]?.id || null;
        if (fallbackId) setSelectedEventId(fallbackId);
      }

      if (showToGuestsEventId === eventId && remaining[0]?.id) {
        await handleShowToGuests(remaining[0].id);
      } else if (showToGuestsEventId === eventId && !remaining[0]?.id) {
        await api.setSelectedEventForGuests(null);
        setShowToGuestsEventId(null);
      }

      setOpenEventMenu(null);
    } catch (error) {
      alert('Failed to delete event: ' + error.message);
    }
  };

  const openEditEventModal = (eventItem) => {
    setEditingEvent({ ...eventItem });
    setIsEditEventModalOpen(true);
  };

  const handleSaveEventEdit = async (e) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      await api.updateEvent(editingEvent.id, {
        status: editingEvent.status,
      });

      setEventsList((prev) => prev.map((ev) => (ev.id === editingEvent.id ? { ...ev, status: editingEvent.status } : ev)));
      setIsEditEventModalOpen(false);
      setEditingEvent(null);
    } catch (error) {
      alert('Failed to update event: ' + error.message);
    }
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    const createdEvent = {
      id: `EV-${Date.now()}`,
      title: newEvent.title,
      dateRange: newEvent.dateRange,
      location: newEvent.location,
      status: newEvent.status,
      metrics: {
        attendance: 0,
        tournament: 0,
        brochure: 0,
        map: 0
      }
    };
    try {
      await api.createEvent(createdEvent);
      setEventsList([createdEvent, ...eventsList]);
      setSelectedEventId(createdEvent.id);
      setIsCreateModalOpen(false);
      setNewEvent({ title: '', dateRange: '', location: '', status: 'Upcoming' });
    } catch (error) {
      alert('Failed to create event: ' + error.message);
    }
  };

   if (isLoading) {
      return (
         <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
               Loading overview data...
            </div>
         </div>
      );
   }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
         <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>Overview</h1>
            <p style={{ color: 'var(--color-text-muted)' }}>Welcome back, Event Host. Here's your summary.</p>
         </div>
         <button 
           onClick={() => setIsCreateModalOpen(true)}
           className="btnSolid scale-btn hover-lift" 
           style={{ background: 'var(--color-primary-dark)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
         >
           <Plus size={18} /> Create New Event
         </button>
      </div>
      
      {/* Top Stats - Active Event Focus */}
      <div style={{ background: 'white', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
          <Calendar size={18} color="var(--color-primary)" /> {currentEvent ? `${currentEvent.title} Metrics` : 'No Event Metrics'}
        </h2>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>{currentEvent?.status || 'Inactive'}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
         {/* Stat Cards */}
         {[
           { label: 'Total Attendance', val: currentEvent?.metrics?.attendance || 0, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
           { label: 'Tournament Engaged', val: currentEvent?.metrics?.tournament || 0, icon: TrendingUp, color: '#10b981', bg: '#ecfdf5' },
           { label: 'Brochure Views', val: currentEvent?.metrics?.brochure || 0, icon: BookOpen, color: '#8b5cf6', bg: '#f5f3ff' },
           { label: 'Map Interactions', val: currentEvent?.metrics?.map || 0, icon: Map, color: '#f59e0b', bg: '#fffbeb' }
         ].map((stat, i) => (
           <div key={i} className="hover-lift" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                 <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{stat.label}</div>
                 <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{stat.val}</div>
              </div>
              <div style={{ background: stat.bg, color: stat.color, padding: '0.75rem', borderRadius: '12px' }}>
                 <stat.icon size={24} />
              </div>
           </div>
         ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
         {/* All Events List */}
         <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
               <h2 style={{ fontSize: '1.125rem', fontWeight: 700 }}>Events List (Click to view metrics)</h2>
            </div>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'visible' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc', color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                     <tr>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Event Name</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {eventsList.slice(0, 5).map((ev, index, list) => (
                        <tr 
                          key={ev.id}
                          style={{ 
                             borderTop: '1px solid #e2e8f0', 
                             background: selectedEventId === ev.id ? '#f1f5f9' : 'white',
                             transition: 'background 0.2s'
                          }} 
                          className="hover-lift"
                        >
                           <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                              {ev.title}
                              {selectedEventId === ev.id && <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: 'var(--color-primary)', background: '#e0e7ff', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>Viewing</span>}
                            {showToGuestsEventId === ev.id && <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', color: '#b45309', background: '#fef3c7', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>Guest Live</span>}
                           </td>
                           <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{ev.dateRange}</td>
                           <td style={{ padding: '1rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ 
                                padding: '0.25rem 0.75rem', 
                                borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                                background: ev.status === 'Upcoming' ? '#fffbeb' : ev.status === 'Active' ? '#ecfdf5' : '#f1f5f9',
                                color: ev.status === 'Upcoming' ? '#d97706' : ev.status === 'Active' ? '#10b981' : '#64748b'
                              }}>
                                {ev.status}
                              </span>
                              
                              {/* Options Menu Button */}
                              <div style={{ position: 'relative' }}>
                                <button
                                  onClick={() => setOpenEventMenu(openEventMenu === ev.id ? null : ev.id)}
                                  style={{ 
                                    background: 'transparent', 
                                    border: 'none', 
                                    cursor: 'pointer',
                                    fontSize: '1.2rem',
                                    padding: '0.25rem 0.5rem',
                                    color: '#64748b'
                                  }}
                                  className="scale-btn"
                                >
                                  ⋮
                                </button>

                                {/* Dropdown Menu */}
                                {openEventMenu === ev.id && (
                                  <div style={{
                                    position: 'absolute',
                                    top: index >= list.length - 2 ? 'auto' : '100%',
                                    bottom: index >= list.length - 2 ? '100%' : 'auto',
                                    right: 0,
                                    background: 'white',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '8px',
                                    boxShadow: 'var(--shadow-md)',
                                    zIndex: 200,
                                    minWidth: '180px',
                                    marginTop: index >= list.length - 2 ? 0 : '0.5rem',
                                    marginBottom: index >= list.length - 2 ? '0.5rem' : 0,
                                    overflow: 'hidden'
                                  }}>
                                    <button
                                      onClick={() => {
                                        setSelectedEventId(ev.id);
                                        setOpenEventMenu(null);
                                      }}
                                      style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        color: '#1f2937',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        transition: 'background 0.2s'
                                      }}
                                      onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    >
                                      View Event
                                    </button>
                                    <button
                                      onClick={() => {
                                        handleShowToGuests(ev.id);
                                        setOpenEventMenu(null);
                                      }}
                                      style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        borderTop: '1px solid #e2e8f0',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        color: '#1f2937',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        transition: 'background 0.2s'
                                      }}
                                      onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    >
                                      Show to Guests
                                    </button>
                                    <button
                                      onClick={() => {
                                        openScheduleModal(ev.id);
                                        setOpenEventMenu(null);
                                      }}
                                      style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        borderTop: '1px solid #e2e8f0',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        color: '#1f2937',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        transition: 'background 0.2s'
                                      }}
                                      onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    >
                                      Manage Schedule
                                    </button>
                                    <button
                                      onClick={() => {
                                        openEditEventModal(ev);
                                        setOpenEventMenu(null);
                                      }}
                                      style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        borderTop: '1px solid #e2e8f0',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        color: '#1f2937',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        transition: 'background 0.2s'
                                      }}
                                      onMouseEnter={(e) => e.target.style.background = '#f8fafc'}
                                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    >
                                      Edit Event Status
                                    </button>
                                    <button
                                      onClick={() => handleDeleteEvent(ev.id, ev.title)}
                                      style={{
                                        display: 'block',
                                        width: '100%',
                                        padding: '0.75rem 1rem',
                                        border: 'none',
                                        borderTop: '1px solid #e2e8f0',
                                        background: 'transparent',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                        color: '#b91c1c',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        transition: 'background 0.2s'
                                      }}
                                      onMouseEnter={(e) => e.target.style.background = '#fef2f2'}
                                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                                    >
                                      Delete Event
                                    </button>
                                  </div>
                                )}
                              </div>
                           </td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Recent Activity Feed */}
         <div>
            <h2 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem' }}>Activity Feed</h2>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem' }}>
            {activityFeed.length === 0 && (
              <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0 }}>No activity yet for this event.</p>
            )}
            {activityFeed.map((act, i) => (
                  <div key={act.id} style={{ display: 'flex', gap: '1rem', marginBottom: i !== activityFeed.length - 1 ? '1.5rem' : 0 }}>
                     <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: `var(--color-${act.color})` }}></div>
                     </div>
                     <div>
                        <p style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>{act.text}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>{act.time}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>

      {/* Edit Event Status Modal */}
      {isEditEventModalOpen && editingEvent && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="animate-scale-in" style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '420px', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Edit Event Status</h2>
              <button onClick={() => { setIsEditEventModalOpen(false); setEditingEvent(null); }} style={{ color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <XCircle size={22} />
              </button>
            </div>

            <p style={{ color: '#64748b', marginBottom: '1rem' }}>
              Event: <strong>{editingEvent.title}</strong>
            </p>

            <form onSubmit={handleSaveEventEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <select
                value={editingEvent.status}
                onChange={(e) => setEditingEvent({ ...editingEvent, status: e.target.value })}
                style={{ padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}
              >
                <option value="Upcoming">Upcoming</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
              </select>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button type="button" className="btnOutline" onClick={() => { setIsEditEventModalOpen(false); setEditingEvent(null); }} style={{ flex: 1, padding: '0.75rem' }}>
                  Cancel
                </button>
                <button type="submit" className="btnSolid" style={{ flex: 1, padding: '0.75rem', background: 'var(--color-primary-dark)' }}>
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manage Schedule Modal */}
      {isScheduleModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
          <div className="animate-scale-in" style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '600px', boxShadow: 'var(--shadow-xl)', maxHeight: '80vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Manage Schedule</h2>
              <button onClick={() => { setIsScheduleModalOpen(false); setScheduleEventId(null); }} style={{ color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <XCircle size={24} />
              </button>
            </div>
            
            <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
              Manage schedules for event: <strong>{eventsList.find(e => e.id === scheduleEventId)?.title}</strong>
            </p>

            <form onSubmit={handleSaveSchedule} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr', gap: '0.75rem', marginBottom: '1rem' }}>
              <input
                value={scheduleForm.title}
                onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                placeholder="Session title"
                required
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <input
                value={scheduleForm.location}
                onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                placeholder="Location"
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <input
                type="datetime-local"
                value={scheduleForm.session_time}
                onChange={(e) => setScheduleForm({ ...scheduleForm, session_time: e.target.value })}
                required
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}
              />
              <select
                value={scheduleForm.status}
                onChange={(e) => setScheduleForm({ ...scheduleForm, status: e.target.value })}
                style={{ padding: '0.7rem', borderRadius: '8px', border: '1px solid #cbd5e1', background: 'white' }}
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.75rem' }}>
                <button type="submit" className="btnSolid scale-btn" style={{ padding: '0.6rem 1rem', background: 'var(--color-primary-dark)' }}>
                  {editingScheduleId ? 'Update Schedule' : 'Add Schedule'}
                </button>
                {editingScheduleId && (
                  <button
                    type="button"
                    className="btnOutline scale-btn"
                    onClick={() => {
                      setEditingScheduleId(null);
                      setScheduleForm({ title: '', location: '', session_time: '', status: 'upcoming' });
                    }}
                    style={{ padding: '0.6rem 1rem' }}
                  >
                    Cancel Edit
                  </button>
                )}
              </div>
            </form>

            <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
              {schedules.length === 0 ? (
                <p style={{ color: '#64748b', fontSize: '0.875rem', margin: 0, padding: '1rem' }}>No schedules yet for this event.</p>
              ) : (
                schedules.map((item) => (
                  <div key={item.id} style={{ padding: '0.85rem 1rem', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', background: 'white' }}>
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 700, color: '#0f172a' }}>{item.title}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{item.location || '-'} | {item.session_time ? new Date(item.session_time).toLocaleString() : '-'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btnOutline" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={() => handleEditSchedule(item)}>
                        Edit
                      </button>
                      <button
                        className="btnOutline"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', color: '#b91c1c', borderColor: '#fecaca' }}
                        onClick={() => handleDeleteSchedule(item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={() => { setIsScheduleModalOpen(false); setScheduleEventId(null); }} 
                className="btnOutline scale-btn" 
                style={{ flex: 1, padding: '0.75rem' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, backdropFilter: 'blur(4px)' }}>
           <div className="animate-scale-in" style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-xl)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                 <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Create New Event</h2>
                 <button onClick={() => setIsCreateModalOpen(false)} style={{ color: '#64748b', background: 'transparent', border: 'none', cursor: 'pointer' }}>
                    <XCircle size={24} />
                 </button>
              </div>
              
              <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                 <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Event Name</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Annual Tech Expo 2027"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                      onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                      required
                    />
                 </div>
                 
                 <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                    <div>
                       <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Date Range</label>
                       <input 
                         type="text" 
                         placeholder="e.g. Oct 24 - 26, 2026"
                         value={newEvent.dateRange}
                         onChange={(e) => setNewEvent({...newEvent, dateRange: e.target.value})}
                         style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s' }}
                         onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                         onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                         required
                       />
                    </div>
                    <div>
                       <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Status</label>
                       <select 
                         value={newEvent.status}
                         onChange={(e) => setNewEvent({...newEvent, status: e.target.value})}
                         style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: 'white' }}
                       >
                          <option value="Upcoming">Upcoming</option>
                          <option value="Active">Active</option>
                          <option value="Completed">Completed</option>
                       </select>
                    </div>
                 </div>

                 <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Location / Venue</label>
                    <input 
                      type="text" 
                      placeholder="e.g. Grand Convention Center"
                      value={newEvent.location}
                      onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '0.75rem 1rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', transition: 'border-color 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                      onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                      required
                    />
                 </div>

                 <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                    <button type="button" onClick={() => setIsCreateModalOpen(false)} className="btnOutline scale-btn" style={{ flex: 1, padding: '0.75rem' }}>Cancel</button>
                    <button type="submit" className="btnSolid scale-btn" style={{ flex: 1, padding: '0.75rem', background: 'var(--color-primary-dark)' }}>Create Event</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
