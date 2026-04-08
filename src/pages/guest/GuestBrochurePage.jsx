import React, { useState } from 'react';
import { BookOpen, Download, FileText, ChevronDown, MessageSquare } from 'lucide-react';
import { initialFiles } from '../../data/mockData';

// Mock host announcements from Brochure
const hostBrochureAnnouncements = [
  { id: 1, text: 'Welcome to our flagship event! Check below for relevant files and schedules.', isPublished: true }
];

export default function GuestBrochurePage() {
  const [previewFileId, setPreviewFileId] = useState(null);

  const togglePreview = (id) => {
    setPreviewFileId(previewFileId === id ? null : id);
  };

  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ padding: '0.75rem', background: 'var(--color-primary)', borderRadius: '12px', color: 'white' }}>
          <BookOpen size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Digital Brochure</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Files & Announcements</p>
        </div>
      </div>

      {/* Host Announcements */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} color="var(--color-warning)" /> Host Updates
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {hostBrochureAnnouncements.filter(a => a.isPublished).map(ann => (
            <div key={ann.id} className="animate-scale-in" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1.25rem', borderRadius: '12px', color: '#92400e', fontSize: '0.875rem', lineHeight: '1.5', boxShadow: 'var(--shadow-sm)' }}>
               <span style={{ fontWeight: 800, display: 'block', marginBottom: '0.25rem', fontSize: '1rem' }}>📢 Announcement</span>
               <div style={{ whiteSpace: 'pre-wrap' }}>{ann.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Uploaded Files List */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-text-main)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FileText size={18} color="var(--color-primary)" /> Event Materials
        </h2>
        
        {initialFiles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '0.875rem' }}>No materials uploaded by host yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {initialFiles.map(file => (
              <div key={file.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: 'white', boxShadow: 'var(--shadow-sm)' }} className="hover-lift">
                <div 
                  onClick={() => togglePreview(file.id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: previewFileId === file.id ? '#f8fafc' : 'white', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    <div style={{ padding: '0.5rem', background: '#e0e7ff', borderRadius: '8px' }}>
                       <FileText size={18} color="var(--color-primary)" style={{ flexShrink: 0 }} />
                    </div>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: '#0f172a' }}>{file.name}</span>
                  </div>
                  <ChevronDown size={18} color="#64748b" style={{ transform: previewFileId === file.id ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }} />
                </div>
                
                {previewFileId === file.id && (
                  <div className="animate-fade-in" style={{ padding: '1.25rem', borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    {file.type && file.type.startsWith('image/') ? (
                      <img src={file.url} alt="Preview" style={{ width: '100%', borderRadius: '8px', marginBottom: '1rem', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }} />
                    ) : (
                      <div style={{ height: '140px', background: '#e2e8f0', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.875rem', marginBottom: '1rem', gap: '0.5rem' }}>
                        <FileText size={32} opacity={0.5} />
                        <span>Preview not available for document</span>
                      </div>
                    )}
                    
                    {file.info && (
                      <p style={{ fontSize: '0.875rem', color: '#475569', marginBottom: '1.25rem', lineHeight: 1.6 }}>
                        {file.info}
                      </p>
                    )}
                    
                    <a 
                      href={file.url} 
                      download={file.name}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxSizing: 'border-box', width: '100%', padding: '0.875rem', background: 'var(--color-primary-dark)', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', boxShadow: 'var(--shadow-sm)' }}
                      className="scale-btn"
                    >
                      <Download size={18} />
                      Download File
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
