import React from 'react';
import { Shield, QrCode, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SystemCards() {
  return (
    <section id="systems" style={{ padding: '6rem 5%', background: '#f8fafc' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-slide-up">
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary-dark)', marginBottom: '1rem' }}>Two Powerful Systems, One Platform</h2>
        <p style={{ fontSize: '1.25rem', color: '#64748b', maxWidth: '800px', margin: '0 auto' }}>
          Separate interfaces designed for hosts and participants, working together seamlessly.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Host System Card */}
        {/* TODO(Backend): Remove this Link wrapper and preview badge once actual backend/auth is connected */}
        <Link to="/dashboard" className="hover-lift" style={{ textDecoration: 'none', color: 'inherit', display: 'block', background: 'white', borderRadius: '16px', padding: '3rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-md)', position: 'relative' }}>
          
          <div style={{ position: 'absolute', top: '2rem', right: '2rem', background: '#eff6ff', color: 'var(--color-primary-light)', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #bfdbfe' }}>
             Preview Dashboard &rarr;
          </div>

          <div style={{ background: 'var(--color-primary-dark)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '2rem' }}>
            <Shield size={32} />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>Host System</h3>
          <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '2rem' }}>
            Full control over your event. Set up attendance, manage tournaments, create brochures, design venue maps, and customize the visual theme — all from one dashboard.
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
             {[
               'Event setup & configuration',
               'Real-time attendance monitoring',
               'Tournament bracket management',
               'Theme & branding customization',
               'QR code generation for participants'
             ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569' }}>
                   <CheckCircle2 size={20} color="var(--color-success)" /> {item}
                </li>
             ))}
          </ul>
        </Link>

        {/* Participant System Card */}
        {/* TODO(Backend): Remove this Link wrapper and preview badge once actual backend/auth is connected */}
        <Link to="/guest" className="hover-lift" style={{ textDecoration: 'none', color: 'inherit', display: 'block', background: 'white', borderRadius: '16px', padding: '3rem', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-md)', position: 'relative' }}>
          
          <div style={{ position: 'absolute', top: '2rem', right: '2rem', background: '#f5f3ff', color: '#8b5cf6', padding: '0.5rem 1rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 700, border: '1px solid #ddd6fe' }}>
             Preview Guest App &rarr;
          </div>

          <div style={{ background: 'var(--color-accent)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '2rem' }}>
            <QrCode size={32} />
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--color-primary-dark)' }}>Participant System</h3>
          <p style={{ color: '#64748b', lineHeight: 1.6, marginBottom: '2rem' }}>
            Scan a QR code to instantly access the event. Check in, view tournament brackets, browse the digital brochure, and navigate the venue — all from your phone.
          </p>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2rem' }}>
             {[
               'QR code instant access',
               'One-tap attendance check-in',
               'Live tournament scores & brackets',
               'Interactive venue navigation'
             ].map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#475569' }}>
                   <CheckCircle2 size={20} color="var(--color-success)" /> {item}
                </li>
             ))}
          </ul>
        </Link>
      </div>
    </section>
  );
}
