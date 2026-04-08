import React from 'react';
import { Trophy, BookOpen, Map, Share2, AlertCircle, Clock } from 'lucide-react';
import AdBanner from '../../components/ui/AdBanner';
import { guestAnnouncements, guestSchedule } from '../../data/mockData';

export default function GuestHomePage() {
  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem' }}>
      {/* Hero Event Card */}
      <div className="hover-lift" style={{ background: 'var(--color-primary-dark)', color: 'white', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(30, 64, 175, 0.4)' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 120, height: 120, background: 'rgba(255,255,255,0.1)', borderRadius: '50%' }}></div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'var(--color-success)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, marginBottom: '1rem' }}>
           <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} className="animate-pulse"></div> Live Now
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem', letterSpacing: '-0.025em' }}>Tech Summit 2026</h1>
        <p style={{ fontSize: '0.875rem', color: '#cbd5e1' }}>Feb 25-27, 2026<br/>Convention Center</p>
      </div>



      {/* Ad Space */}
      <AdBanner height="100px" className="animate-slide-up" />

      {/* Announcements */}
      <div style={{ marginTop: '2rem' }}>
         <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-main)' }}>
            <AlertCircle size={20} color="var(--color-warning)" /> Announcements
         </h2>
         <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {guestAnnouncements.map((ann) => (
               <div key={ann.id} style={{ background: ann.isUrgent ? '#fef2f2' : '#f8fafc', borderLeft: `4px solid ${ann.isUrgent ? 'var(--color-danger)' : 'var(--color-primary-light)'}`, padding: '1rem', borderRadius: '0 8px 8px 0', border: '1px solid #e2e8f0', borderLeftWidth: '4px' }}>
                  <p style={{ fontWeight: 600, color: ann.isUrgent ? '#991b1b' : 'var(--color-text-main)', fontSize: '0.875rem' }}>{ann.message}</p>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem', display: 'block' }}>{ann.time}</span>
               </div>
            ))}
         </div>
      </div>

      {/* Schedule Timeline */}
      <div style={{ marginTop: '2rem' }}>
         <h2 style={{ fontSize: '1.125rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-main)' }}>
            <Clock size={20} color="var(--color-primary)" /> Today's Schedule
         </h2>
         <div style={{ position: 'relative', paddingLeft: '1rem' }}>
            {/* Vertical timeline line */}
            <div style={{ position: 'absolute', left: '1.3rem', top: '1rem', bottom: '1rem', width: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 1 }}>
               {guestSchedule.slice(0, 4).map((sch) => {
                 const isPast = sch.status === 'completed';
                 const isActive = sch.status === 'active';
                 
                 return (
                   <div key={sch.id} style={{ display: 'flex', gap: '1rem' }}>
                      {/* Timeline dot */}
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: isActive ? 'var(--color-primary)' : isPast ? '#cbd5e1' : 'white', border: `2px solid ${isActive ? 'var(--color-primary)' : '#cbd5e1'}`, marginTop: '0.25rem', flexShrink: 0 }}></div>
                      
                      {/* Content */}
                      <div style={{ opacity: isPast ? 0.6 : 1, flex: 1 }}>
                         <div style={{ fontSize: '0.75rem', fontWeight: 700, color: isActive ? 'var(--color-primary)' : '#64748b', marginBottom: '0.125rem' }}>{sch.time}</div>
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
