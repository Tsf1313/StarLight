import React, { useEffect, useState } from 'react';
import { MessageCircle } from 'lucide-react';
import { defaultFeedbackFormConfig, getFeedbackFormConfig, saveFeedbackFormConfig } from '../../data/mockData';

export default function FeedbackPage() {
  const [formConfig, setFormConfig] = useState(defaultFeedbackFormConfig);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setFormConfig(getFeedbackFormConfig());
  }, []);

  const handleSave = () => {
    saveFeedbackFormConfig(formConfig);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1100px', margin: '0 auto', padding: '1rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--color-primary)' }}>
            <MessageCircle size={20} />
            <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Feedback Management</span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--color-text-main)', margin: 0 }}>Feedback form settings</h1>
          <p style={{ color: '#64748b', marginTop: '0.5rem', maxWidth: '620px' }}>Configure the Google Form URL and the guest-facing instructions used in the feedback experience.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '20px', padding: '1.5rem', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.75rem', color: 'var(--color-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', fontSize: '0.8rem' }}>
                Form settings
              </div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Update the guest feedback form</h2>
              <p style={{ color: '#64748b', marginTop: '0.5rem' }}>Set the URL and guest-facing prompt used by the Google Form.</p>
            </div>

            <div style={{ display: 'grid', gap: '1rem' }}>
              <label style={{ display: 'grid', gap: '0.5rem', fontWeight: 700, color: '#475569' }}>
                Feedback form URL
                <input
                  type="text"
                  value={formConfig.link}
                  onChange={(e) => setFormConfig({ ...formConfig, link: e.target.value })}
                  style={{ width: '100%', padding: '0.95rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a' }}
                />
              </label>

              <label style={{ display: 'grid', gap: '0.5rem', fontWeight: 700, color: '#475569' }}>
                Feedback prompt
                <textarea
                  rows={4}
                  value={formConfig.description}
                  onChange={(e) => setFormConfig({ ...formConfig, description: e.target.value })}
                  style={{ width: '100%', padding: '0.95rem 1rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#0f172a', resize: 'vertical' }}
                />
              </label>

              <button
                onClick={handleSave}
                className="scale-btn hover-lift"
                style={{ width: 'fit-content', padding: '0.95rem 1.25rem', borderRadius: '12px', border: 'none', background: 'var(--color-primary)', color: 'white', fontWeight: 700, cursor: 'pointer' }}
              >
                Save settings
              </button>
              {saved && <div style={{ color: 'var(--color-success)', fontWeight: 700 }}>Saved successfully.</div>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
