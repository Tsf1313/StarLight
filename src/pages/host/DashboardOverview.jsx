import React, { useState } from 'react';
import { Users, BookOpen, Map, Settings, TrendingUp, Calendar, ArrowUpRight, Plus, XCircle } from 'lucide-react';
import { hostEvents, hostRecentActivity } from '../../data/mockData';

export default function DashboardOverview() {
  const [eventsList, setEventsList] = useState(hostEvents);
  const [activeEventId, setActiveEventId] = useState(hostEvents[0].id);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  // New event form state
  const [newEvent, setNewEvent] = useState({
    title: '',
    dateRange: '',
    location: '',
    status: 'Upcoming'
  });

  const currentEvent = eventsList.find(e => e.id === activeEventId) || eventsList[0];

  const handleCreateSubmit = (e) => {
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
    setEventsList([createdEvent, ...eventsList]);
    setActiveEventId(createdEvent.id); // Automatically switch to the new event
    setIsCreateModalOpen(false);
    setNewEvent({ title: '', dateRange: '', location: '', status: 'Upcoming' }); // Reset
  };

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
            <Calendar size={18} color="var(--color-primary)" /> {currentEvent.title} Metrics
         </h2>
         <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-primary)' }}>{currentEvent.status}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
         {/* Stat Cards */}
         {[
           { label: 'Total Attendance', val: currentEvent.metrics?.attendance || 0, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
           { label: 'Tournament Engaged', val: currentEvent.metrics?.tournament || 0, icon: TrendingUp, color: '#10b981', bg: '#ecfdf5' },
           { label: 'Brochure Views', val: currentEvent.metrics?.brochure || 0, icon: BookOpen, color: '#8b5cf6', bg: '#f5f3ff' },
           { label: 'Map Interactions', val: currentEvent.metrics?.map || 0, icon: Map, color: '#f59e0b', bg: '#fffbeb' }
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
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc', color: 'var(--color-text-muted)', fontSize: '0.75rem', textTransform: 'uppercase' }}>
                     <tr>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Event Name</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Date</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                     </tr>
                  </thead>
                  <tbody>
                     {eventsList.slice(0, 5).map((ev) => (
                        <tr 
                          key={ev.id} 
                          onClick={() => setActiveEventId(ev.id)}
                          style={{ 
                             borderTop: '1px solid #e2e8f0', 
                             cursor: 'pointer',
                             background: activeEventId === ev.id ? '#f1f5f9' : 'white',
                             transition: 'background 0.2s'
                          }} 
                          className="hover-lift"
                        >
                           <td style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-main)' }}>
                              {ev.title}
                              {activeEventId === ev.id && <span style={{ marginLeft: '0.75rem', fontSize: '0.75rem', color: 'var(--color-primary)', background: '#e0e7ff', padding: '0.1rem 0.5rem', borderRadius: '4px' }}>Viewing</span>}
                           </td>
                           <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>{ev.dateRange}</td>
                           <td style={{ padding: '1rem 1.5rem' }}>
                              <span style={{ 
                                padding: '0.25rem 0.75rem', 
                                borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                                background: ev.status === 'Upcoming' ? '#fffbeb' : ev.status === 'Active' ? '#ecfdf5' : '#f1f5f9',
                                color: ev.status === 'Upcoming' ? '#d97706' : ev.status === 'Active' ? '#10b981' : '#64748b'
                              }}>
                                {ev.status}
                              </span>
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
               {hostRecentActivity.map((act, i) => (
                  <div key={act.id} style={{ display: 'flex', gap: '1rem', marginBottom: i !== hostRecentActivity.length - 1 ? '1.5rem' : 0 }}>
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
