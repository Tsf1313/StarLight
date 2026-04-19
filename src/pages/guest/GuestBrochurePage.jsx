import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom'; // NEW: Hook to catch the theme
import { BookOpen, Download, FileText, ChevronDown, MessageSquare } from 'lucide-react';
import { initialFiles } from '../../data/mockData';
import { api } from '../../services/api';

// Mock host announcements from Brochure
const hostBrochureAnnouncements = [
  { id: 1, text: 'Welcome to our flagship event! Check below for relevant files and schedules.', isPublished: true }
];

export default function GuestBrochurePage() {
  const [previewFileId, setPreviewFileId] = useState(null);
  const [files, setFiles] = useState(initialFiles);
  const [announcements, setAnnouncements] = useState(hostBrochureAnnouncements);
  
  // Catch the custom theme passed down from GuestLayout
  const { theme } = useOutletContext();

  useEffect(() => {
    const loadBrochureData = async () => {
      try {
        const [fileRows, announcementRows] = await Promise.all([
          api.getGuestBrochures(),
          api.getGuestAnnouncements(),
        ]);
        if (fileRows.length) {
          setFiles(fileRows);
        }
        if (announcementRows.length) {
          setAnnouncements(
            announcementRows.map((item) => ({
              id: item.id,
              text: item.message,
              isPublished: true,
            }))
          );
        }
      } catch (error) {
        console.error('Failed to load guest brochure data:', error);
      }
    };

    loadBrochureData();
    const intervalId = setInterval(loadBrochureData, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const togglePreview = (id) => {
    setPreviewFileId(previewFileId === id ? null : id);
  };

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
          <BookOpen size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Digital Brochure</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Files & Announcements</p>
        </div>
      </div>

      {/* Host Announcements */}
      <div style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <MessageSquare size={18} color="var(--color-warning)" /> Host Updates
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {announcements.filter(a => a.isPublished).map(ann => (
            <div key={ann.id} className="animate-scale-in" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1.25rem', borderRadius: '12px', color: '#92400e', fontSize: '0.875rem', lineHeight: '1.5', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
               <span style={{ fontWeight: 800, display: 'block', marginBottom: '0.25rem', fontSize: '1rem' }}>📢 Announcement</span>
               <div style={{ whiteSpace: 'pre-wrap' }}>{ann.text}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Uploaded Files List */}
      <div>
        <h2 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* Dynamic primary color for the section icon */}
          <FileText size={18} color={theme?.primary_color || "var(--color-primary)"} /> Event Materials
        </h2>
        
        {files.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '0.875rem' }}>No materials uploaded by host yet.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {files.map(file => (
              <div key={file.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: 'white', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }} className="hover-lift">
                <div 
                  onClick={() => togglePreview(file.id)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: previewFileId === file.id ? '#f8fafc' : 'white', cursor: 'pointer', transition: 'background 0.2s' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', overflow: 'hidden' }}>
                    <div style={{ padding: '0.5rem', background: `${theme?.primary_color || '#3b82f6'}15`, borderRadius: '8px' }}>
                       {/* Dynamic primary color for the file icon */}
                       <FileText size={18} color={theme?.primary_color || "var(--color-primary)"} style={{ flexShrink: 0 }} />
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
                      // Dynamic primary color for the Download Button
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxSizing: 'border-box', width: '100%', padding: '0.875rem', background: theme?.primary_color || 'var(--color-primary-dark)', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
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