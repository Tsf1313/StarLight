import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom'; // NEW: Hook to catch the theme
import { Trophy, BookOpen, Map, Share2, AlertCircle, Clock } from 'lucide-react';
import AdBanner from '../../components/ui/AdBanner';
import { api } from '../../services/api';

export default function GuestHomePage() {
  // Catch the custom theme passed down from GuestLayout
  const { theme } = useOutletContext(); 
   const [announcements, setAnnouncements] = useState([]);
   const [schedule, setSchedule] = useState([]);
   const [guestEvent, setGuestEvent] = useState(null);

   useEffect(() => {
      const loadGuestHomeData = async () => {
         try {
            const [announcementRows, scheduleRows] = await Promise.all([
               api.getGuestAnnouncements(),
               api.getGuestSchedule(),
            ]);

            const guestEventData = await api.getSelectedEventForGuests();
            setGuestEvent(guestEventData?.event || null);

            setAnnouncements(Array.isArray(announcementRows) ? announcementRows : []);
            setSchedule(Array.isArray(scheduleRows) ? scheduleRows : []);
         } catch (error) {
            console.error('Failed to load guest home data:', error);
         }
      };

      loadGuestHomeData();

      const handleStorageSync = (event) => {
        if (event.key === 'showToGuestsEventId') {
          loadGuestHomeData();
        }
      };

      window.addEventListener('storage', handleStorageSync);
      const intervalId = setInterval(loadGuestHomeData, 2000);

      return () => {
        window.removeEventListener('storage', handleStorageSync);
        clearInterval(intervalId);
      };
   }, []);

  return (
    <div 
      className="animate-fade-in" 
      style={{ 
        padding: '1.25rem', 
        paddingBottom: '2rem',
        minHeight: '100%',
        background: '#f8fafc' /* Clean, solid light-gray background */
      }}
    >
      {/* Hero Event Card */}
      <div className="hover-lift" style={{ background: theme?.primary_color || 'var(--color-primary-dark)', color: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden', boxShadow: `0 10px 15px -3px ${theme?.primary_color || 'var(--color-primary-dark)'}60` }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'var(--color-success)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} className={guestEvent ? 'animate-pulse' : ''}></div> {guestEvent ? 'Live Now' : 'Standby'}
        </div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>
               {guestEvent?.title || 'No Event Right Now'}
            </h1>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.8)' }}>
               {guestEvent ? (
                  <>
                     {guestEvent?.date_range || ''}
                     <br />
                     {guestEvent?.location || ''}
                  </>
               ) : (
                  'Please check back shortly for the next live event.'
               )}
            </p>
      </div>

      {/* Ad Space */}
      <AdBanner height="100px" className="animate-slide-up" />

      {/* Announcements */}
      <div style={{ marginTop: '2rem' }}>
         <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-main)' }}>
            <AlertCircle size={20} color="var(--color-warning)" /> Announcements
         </h2>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {announcements.map((ann) => (
               <div key={ann.id} style={{ background: ann.isUrgent ? '#fef2f2' : 'white', borderLeft: `4px solid ${ann.isUrgent ? 'var(--color-danger)' : (theme?.primary_color || 'var(--color-primary-light)')}`, padding: '1rem', borderRadius: '0 8px 8px 0', borderTop: '1px solid #e2e8f0', borderRight: '1px solid #e2e8f0', borderBottom: '1px solid #e2e8f0', borderLeftWidth: '4px', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                  <p style={{ fontWeight: 600, color: ann.isUrgent ? '#991b1b' : 'var(--color-text-main)', fontSize: '0.875rem' }}>{ann.message}</p>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>{ann.time}</span>
               </div>
            ))}
         </div>
      </div>

      {/* Schedule Timeline */}
      <div style={{ marginTop: '2rem', background: 'white', padding: '1.5rem 1rem', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
         <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-main)' }}>
            <Clock size={20} color={theme?.primary_color || 'var(--color-primary)'} /> Today's Schedule
         </h2>
         <div style={{ position: 'relative', paddingLeft: '1rem' }}>
            {/* Vertical timeline line */}
            <div style={{ position: 'absolute', left: '1.3rem', top: '0.5rem', bottom: '1rem', width: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
               {schedule.slice(0, 4).map((sch) => {
                 const isPast = sch.status === 'completed';
                 const isActive = sch.status === 'active';
                 
                 return (
                   <div key={sch.id} style={{ display: 'flex', gap: '1rem' }}>
                      {/* Timeline dot */}
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isActive ? (theme?.primary_color || 'var(--color-primary)') : isPast ? '#cbd5e1' : 'white', border: `2px solid ${isActive ? (theme?.primary_color || 'var(--color-primary)') : '#cbd5e1'}`, marginTop: '0.25rem', flexShrink: 0 }}></div>
                      
                      {/* Content */}
                      <div style={{ opacity: isPast ? 0.6 : 1, flex: 1 }}>
                         <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? (theme?.primary_color || 'var(--color-primary)') : '#64748b', marginBottom: '0.125rem' }}>{sch.time}</div>
                         <div style={{ fontSize: '0.9375rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{sch.title}</div>
                         <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{sch.location}</div>
                      </div>
                   </div>
                 )
               })}
            </div>
         </div>
      </div>
    </div>
  );
}