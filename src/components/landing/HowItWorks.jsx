import React from 'react';

const steps = [
  { num: '01', title: 'Create Event', desc: 'Set up your event with all details, customize the theme, and configure features.' },
  { num: '02', title: 'Generate QR Code', desc: 'Share the unique QR code with participants for instant event access.' },
  { num: '03', title: 'Manage Live', desc: 'Track attendance, run tournaments, and manage in real-time.' },
  { num: '04', title: 'Review & Export', desc: 'Access comprehensive reports and export data after the event.' }
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" style={{ padding: '6rem 5%', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-slide-up">
        <h4 style={{ color: 'var(--color-accent)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>HOW IT WORKS</h4>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>Get Started in 4 Simple Steps</h2>
      </div>

      <div style={{ display: 'flex', flexDirection: 'row', gap: '2rem', maxWidth: '1200px', margin: '0 auto', flexWrap: 'wrap', justifyContent: 'center' }}>
         {steps.map((step, i) => (
            <div key={i} style={{ flex: '1 1 250px', textAlign: 'center', position: 'relative' }}>
               <div style={{ width: '80px', height: '80px', margin: '0 auto 1.5rem', background: 'var(--color-primary-dark)', color: 'white', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', fontWeight: 700, position: 'relative', zIndex: 2, boxShadow: 'var(--shadow-md)' }}>
                 {step.num}
               </div>
               {/* Connecting horizontal line for desktop (hidden via logic or CSS usually) */}
               {i < steps.length - 1 && (
                  <div style={{ position: 'absolute', top: '40px', left: '50%', width: '100%', height: '2px', background: '#cbd5e1', zIndex: 1, display: 'none' }} className="timeline-connector"></div>
               )}
               <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-primary-dark)' }}>{step.title}</h3>
               <p style={{ color: '#64748b', fontSize: '0.9375rem', lineHeight: 1.6 }}>{step.desc}</p>
            </div>
         ))}
      </div>
    </section>
  );
}
