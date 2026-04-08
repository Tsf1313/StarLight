import React, { useEffect, useState } from 'react';
import { MessageSquare, ExternalLink, Star } from 'lucide-react';
import { defaultFeedbackFormConfig, getFeedbackFormConfig } from '../../data/mockData';

export default function GuestFeedbackPage() {
  const [formConfig, setFormConfig] = useState(defaultFeedbackFormConfig);

  useEffect(() => {
    setFormConfig(getFeedbackFormConfig());
  }, []);

  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ padding: '0.75rem', background: 'var(--color-primary)', borderRadius: '12px', color: 'white' }}>
          <MessageSquare size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>Feedback</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0' }}>We value your opinion</p>
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: 'var(--shadow-sm)', maxWidth: '760px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: 'var(--color-text-main)' }}>{formConfig.heading}</h2>
          <p style={{ fontSize: '0.95rem', color: '#475569', marginTop: '0.75rem', lineHeight: 1.75 }}>{formConfig.description}</p>
        </div>

        <a
          href={formConfig.link}
          target="_blank"
          rel="noopener noreferrer"
          className="scale-btn hover-lift"
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: 'var(--color-primary)', color: 'white', padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', width: '100%', boxSizing: 'border-box' }}
        >
          {formConfig.buttonText} <ExternalLink size={18} />
        </a>
      </div>
    </div>
  );
}
