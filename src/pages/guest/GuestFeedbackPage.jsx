import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom'; // NEW: Hook to catch the theme
import { MessageSquare, ExternalLink, Star } from 'lucide-react';
import { defaultFeedbackFormConfig, getFeedbackFormConfig } from '../../data/mockData';

export default function GuestFeedbackPage() {
  const [formConfig, setFormConfig] = useState(defaultFeedbackFormConfig);
  
  // Catch the custom theme passed down from GuestLayout
  const { theme } = useOutletContext();

  useEffect(() => {
    setFormConfig(getFeedbackFormConfig());
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
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        {/* Dynamic primary color for the header icon */}
        <div style={{ padding: '0.75rem', background: theme?.primary_color || 'var(--color-primary)', borderRadius: '12px', color: 'white' }}>
          <MessageSquare size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>Feedback</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: '0.25rem 0 0' }}>We value your opinion</p>
        </div>
      </div>

      <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.75rem', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', maxWidth: '760px' }}>
        <div style={{ marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0, color: '#0f172a' }}>{formConfig.heading}</h2>
          <p style={{ fontSize: '0.95rem', color: '#475569', marginTop: '0.75rem', lineHeight: 1.75 }}>{formConfig.description}</p>
        </div>

        <a
          href={formConfig.link}
          target="_blank"
          rel="noopener noreferrer"
          className="scale-btn hover-lift"
          // Dynamic primary color for the external link button
          style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', background: theme?.primary_color || 'var(--color-primary)', color: 'white', padding: '1rem 1.5rem', borderRadius: '14px', fontWeight: 700, fontSize: '0.95rem', textDecoration: 'none', width: '100%', boxSizing: 'border-box', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
        >
          {formConfig.buttonText} <ExternalLink size={18} />
        </a>
      </div>
    </div>
  );
}