import React from 'react';
import { Users, Trophy, BookOpen, MapPin, Paintbrush } from 'lucide-react';

const coreFeatures = [
  {
    icon: Users,
    title: 'Attendance Tracking',
    desc: 'Real-time check-in with QR codes, live attendance stats, and automated participant management.'
  },
  {
    icon: Trophy,
    title: 'Tournament Management',
    desc: 'Build brackets, schedule matches, track scores, and display live leaderboards effortlessly.'
  },
  {
    icon: BookOpen,
    title: 'Information Brochure',
    desc: 'Create digital brochures with event schedules, sponsor details, and important announcements.'
  },
  {
    icon: MapPin,
    title: 'Venue Map',
    desc: 'Interactive venue maps with zone markers, navigation paths, and real-time location guidance.'
  },
  {
    icon: Paintbrush,
    title: 'Theme Customization',
    desc: "Customize backgrounds, colors, and branding to match your event's unique identity."
  }
];

export default function FeaturesGrid() {
  return (
    <section id="features" style={{ padding: '6rem 5%', background: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-slide-up">
        <h4 style={{ color: 'var(--color-accent)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>FEATURES</h4>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>Everything You Need for Your Event</h2>
        <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '800px', margin: '0 auto' }}>
          From attendance to venue maps, EventFlow provides all the tools to run a successful event.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
         {coreFeatures.map((feat, i) => {
           const Icon = feat.icon;
           return (
             <div key={i} className="hover-lift" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '180px', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                   {/* Abstract graphic placeholder since we don't have the exact image assets */}
                   <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #e0f2fe, #bfdbfe)' }}></div>
                   <div style={{ position: 'absolute', bottom: '-20px', left: '20px', background: 'white', padding: '0.75rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
                     <Icon size={24} color="var(--color-primary-dark)" />
                   </div>
                </div>
                <div style={{ padding: '2.5rem 1.5rem 1.5rem', flex: 1, background: 'white' }}>
                   <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-primary-dark)' }}>{feat.title}</h3>
                   <p style={{ color: '#64748b', lineHeight: 1.5 }}>{feat.desc}</p>
                </div>
             </div>
           )
         })}
      </div>
    </section>
  );
}
