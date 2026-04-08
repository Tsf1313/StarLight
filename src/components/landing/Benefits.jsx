import React from 'react';
import { Zap, BarChart2, CheckCircle, ShieldCheck } from 'lucide-react';

const benefits = [
  { icon: Zap, title: 'Reduce Workload', desc: 'Eliminate the need to juggle multiple applications' },
  { icon: BarChart2, title: 'Data Accuracy', desc: 'Single source of truth for all event data' },
  { icon: CheckCircle, title: 'Smooth Process', desc: 'Seamless experience from setup to execution' },
  { icon: ShieldCheck, title: 'Secure Access', desc: 'QR-based entry ensures only authorized participants' }
];

export default function Benefits() {
  return (
    <section id="benefits" style={{ padding: '6rem 5%', background: 'white' }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }} className="animate-slide-up">
        <h4 style={{ color: 'var(--color-accent)', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: '1rem' }}>BENEFITS</h4>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>Why Event Planners Choose EventFlow</h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
          {benefits.map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className="hover-lift" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
                 <div style={{ width: '56px', height: '56px', background: 'var(--color-accent)', color: 'white', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
                    <Icon size={28} />
                 </div>
                 <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--color-text-main)' }}>{b.title}</h3>
                 <p style={{ color: '#64748b', fontSize: '0.875rem', lineHeight: 1.5 }}>{b.desc}</p>
              </div>
            )
          })}
      </div>
    </section>
  );
}
