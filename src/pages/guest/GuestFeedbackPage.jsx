import React from 'react';
import { MessageSquare, ExternalLink, Star } from 'lucide-react';

export default function GuestFeedbackPage() {
  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem', paddingBottom: '2rem', display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 140px)' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ padding: '0.75rem', background: 'var(--color-primary)', borderRadius: '12px', color: 'white' }}>
          <MessageSquare size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Feedback</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>We value your opinion</p>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
         <div style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)', borderRadius: '24px', padding: '2.5rem 1.5rem', textAlign: 'center', color: 'white', boxShadow: '0 20px 25px -5px rgba(59, 130, 246, 0.4)' }}>
            <div style={{ width: 80, height: 80, background: 'rgba(255,255,255,0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', border: '2px solid rgba(255,255,255,0.4)', backdropFilter: 'blur(4px)' }}>
               <Star size={40} color="#fde047" fill="#fde047" className="animate-pulse" />
            </div>
            
            <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.75rem' }}>How was your experience?</h2>
            <p style={{ fontSize: '0.9375rem', color: 'rgba(255,255,255,0.8)', marginBottom: '2rem', lineHeight: 1.6 }}>
               Your feedback shapes the future of our events. Take a brief moment to share your thoughts with us.
            </p>

            <a 
               href="https://forms.google.com" 
               target="_blank" 
               rel="noopener noreferrer"
               className="scale-btn hover-lift"
               style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'white', color: 'var(--color-primary-dark)', padding: '1rem 2rem', borderRadius: '99px', fontWeight: 800, fontSize: '1rem', textDecoration: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', width: '100%', boxSizing: 'border-box' }}
            >
               Open Feedback Form <ExternalLink size={18} />
            </a>
            
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', marginTop: '1.5rem' }}>
               Redirects to a secure Google Form.
            </p>
         </div>
      </div>
    </div>
  );
}
