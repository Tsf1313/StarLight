import React, { useState } from 'react';
import { GripVertical, Trash2, FileUp, Download, FileText, ChevronDown, Eye, CheckCircle2, MessageSquare, Plus } from 'lucide-react';
import { initialFiles } from '../../data/mockData';
export default function BrochurePage() {
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);

  const [announcements, setAnnouncements] = useState([
    { id: 1, text: 'Welcome to our flagship event! Check below for relevant files and schedules.', isPublished: true }
  ]);

  const handlePublish = () => {
    setIsPublishing(true);
    setTimeout(() => {
      setIsPublishing(false);
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
    }, 1500);
  };

  const addAnnouncement = () => {
    setAnnouncements([...announcements, { id: Date.now(), text: '', isPublished: false }]);
  };

  const updateAnnouncement = (id, text) => {
    setAnnouncements(announcements.map(a => a.id === id ? { ...a, text } : a));
  };

  const removeAnnouncement = (id) => {
    setAnnouncements(announcements.filter(a => a.id !== id));
  };

  const togglePublishAnnouncement = (id) => {
    setAnnouncements(announcements.map(a => {
      if (a.id === id) {
        if (!a.isPublished) {
          alert('Announcement published successfully!');
        }
        return { ...a, isPublished: !a.isPublished };
      }
      return a;
    }));
  };

  const [files, setFiles] = useState(initialFiles);
  const [previewFileId, setPreviewFileId] = useState(null);

  const handleFileUpload = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      const newFile = {
        id: Date.now(),
        name: file.name,
        size: file.size,
        type: file.type,
        url: URL.createObjectURL(file),
        info: ''
      };
      setFiles([...files, newFile]);
      e.target.value = null;
    }
  };

  const updateFileInfo = (id, newInfo) => {
    setFiles(files.map(f => f.id === id ? { ...f, info: newInfo } : f));
  };

  const removeFile = (id) => {
    setFiles(files.filter(f => f.id !== id));
    if (previewFileId === id) setPreviewFileId(null);
  };

  const togglePreview = (id) => {
    setPreviewFileId(previewFileId === id ? null : id);
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexShrink: 0 }}>
        <div>
           <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>Digital Brochure Materials</h1>
           <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Upload and manage files that participants can view and download.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
           <button 
             onClick={handlePublish}
             disabled={isPublishing}
             className="btnSolid hover-lift" 
             style={{ 
               background: published ? '#10b981' : 'var(--color-primary-dark)', 
               display: 'flex', 
               alignItems: 'center', 
               gap: '0.5rem',
               padding: '0.75rem 1.75rem',
               borderRadius: '8px',
               color: 'white',
               fontWeight: 600,
               transition: 'all 0.3s ease',
               opacity: isPublishing ? 0.7 : 1,
               cursor: isPublishing ? 'not-allowed' : 'pointer',
               border: 'none',
               boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
             }}>
              {isPublishing ? (
                <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>↻</span>
              ) : published ? (
                <CheckCircle2 size={18} />
              ) : null}
              {isPublishing ? 'Publishing Files...' : published ? 'Files Published!' : 'Publish All Files'}
           </button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: 0 }}>
        {/* Editor blocks column */}
        <div style={{ flex: 2, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', paddingRight: '0.5rem' }}>
           
           {/* Add Content Block -> Main Upload Area */}
           <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2.5rem 2rem', marginBottom: '0.5rem', textAlign: 'center', boxShadow: 'var(--shadow-sm)' }}>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
                 <div style={{ padding: '1rem', background: '#e0e7ff', borderRadius: '50%' }}>
                    <FileUp size={40} color="var(--color-primary)" />
                 </div>
              </div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>Upload New Material</h3>
              <p style={{ color: '#64748b', fontSize: '0.875rem', marginBottom: '2rem' }}>Add images, PDFs, or documents for your participants to easily access.</p>
              
              <label className="btnSolid scale-btn hover-lift" style={{ background: 'var(--color-primary)', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.875rem 2.5rem', fontWeight: 600, fontSize: '1rem', borderRadius: '8px' }}>
                <FileUp size={20} />
                Select File to Upload
                <input type="file" style={{ display: 'none' }} onChange={handleFileUpload} />
              </label>
           </div>

           {/* Uploaded Files List */}
           {files.map((file) => (
              <div key={file.id} className="hover-lift" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex' }}>
                 <div style={{ padding: '1rem', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', cursor: 'grab', flexShrink: 0, borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                    <GripVertical size={20} color="#94a3b8" />
                 </div>
                 <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflow: 'hidden' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', overflow: 'hidden' }}>
                         <div style={{ padding: '0.75rem', background: '#f1f5f9', borderRadius: '8px' }}>
                            <FileText color="var(--color-primary)" size={24} style={{ flexShrink: 0 }} />
                         </div>
                         <div>
                           <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                           <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{(file.size / 1024 / 1024).toFixed(2)} MB</div>
                         </div>
                       </div>
                       <div style={{ display: 'flex', gap: '0.5rem' }}>
                         <button onClick={() => togglePreview(file.id)} className="btnOutline hover-lift" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px' }}>
                           <Eye size={16} />
                           {previewFileId === file.id ? 'Hide Preview' : 'Preview Live'}
                         </button>
                         <button onClick={() => removeFile(file.id)} className="hover-lift" style={{ color: 'var(--color-danger)', background: '#fef2f2', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }} title="Delete File">
                           <Trash2 size={18} />
                         </button>
                       </div>
                    </div>
                    <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                       <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>File Information / Description</label>
                       <input 
                          type="text" 
                          placeholder="e.g., Download the full event schedule and venue map here." 
                          value={file.info}
                          onChange={(e) => updateFileInfo(file.id, e.target.value)}
                          style={{ boxSizing: 'border-box', width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.875rem', background: 'white', outline: 'none' }}
                       />
                    </div>
                 </div>
              </div>
           ))}

           {/* Announcement Blocks Section */}
           <div style={{ marginTop: '2rem', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                 <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Announcements</h3>
                 <button onClick={addAnnouncement} className="btnSolid scale-btn hover-lift" style={{ padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--color-primary)' }}>
                   <Plus size={16}/> New Announcement
                 </button>
              </div>
              
              {announcements.map(ann => (
                 <div key={ann.id} className="animate-fade-in" style={{ background: 'white', borderRadius: '12px', border: ann.isPublished ? '2px solid #10b981' : '1px solid #e2e8f0', padding: '1.5rem', marginBottom: '1rem', boxShadow: 'var(--shadow-sm)', transition: 'border-color 0.2s' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                       <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <MessageSquare size={20} color={ann.isPublished ? '#10b981' : '#d97706'} />
                          <span style={{ fontSize: '0.875rem', fontWeight: 700, color: ann.isPublished ? '#10b981' : '#d97706', background: ann.isPublished ? '#ecfdf5' : '#fef3c7', padding: '0.25rem 0.75rem', borderRadius: '99px' }}>
                            {ann.isPublished ? 'Live on Client' : 'Draft'}
                          </span>
                       </div>
                       <div style={{ display: 'flex', gap: '0.5rem' }}>
                         <button onClick={() => removeAnnouncement(ann.id)} className="hover-lift" style={{ color: 'var(--color-danger)', background: '#fef2f2', padding: '0.5rem', borderRadius: '6px', border: 'none', cursor: 'pointer' }} title="Delete"><Trash2 size={18} /></button>
                       </div>
                    </div>
                    <textarea 
                      placeholder="Type your announcement or welcome message here..."
                      value={ann.text}
                      onChange={(e) => updateAnnouncement(ann.id, e.target.value)}
                      style={{ width: '100%', boxSizing: 'border-box', padding: '1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', resize: 'vertical', minHeight: '80px', fontSize: '0.95rem', marginBottom: '1rem', transition: 'border-color 0.2s' }}
                      onFocus={(e) => e.target.style.borderColor = 'var(--color-primary)'}
                      onBlur={(e) => e.target.style.borderColor = '#cbd5e1'}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                       <button 
                         onClick={() => togglePublishAnnouncement(ann.id)} 
                         className="hover-lift"
                         style={{ 
                           padding: '0.5rem 1rem', 
                           background: ann.isPublished ? '#f1f5f9' : '#10b981', 
                           color: ann.isPublished ? '#64748b' : 'white',
                           border: ann.isPublished ? '1px solid #cbd5e1' : 'none',
                           borderRadius: '6px',
                           fontWeight: 600,
                           cursor: 'pointer',
                           transition: 'all 0.2s',
                           display: 'flex',
                           alignItems: 'center',
                           gap: '0.5rem'
                         }}
                       >
                          {ann.isPublished ? 'Unpublish' : <> <CheckCircle2 size={16} /> Publish Now </>}
                       </button>
                    </div>
                 </div>
              ))}
              {announcements.length === 0 && (
                <div style={{ padding: '2rem', textAlign: 'center', border: '2px dashed #cbd5e1', borderRadius: '12px', color: '#64748b' }}>
                  No announcements created yet.
                </div>
              )}
           </div>
        </div>

        {/* Live Preview Pane */}
        <div style={{ flex: 1, background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: '400px' }}>
           <div style={{ padding: '1rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'center' }}>
             <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#64748b' }}>Live Mobile Preview</h3>
           </div>
           
           <div style={{ flex: 1, background: '#e2e8f0', padding: '2rem', display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
              {/* Phone Mockup Frame */}
              <div style={{ width: '320px', height: '600px', background: 'white', borderRadius: '32px', border: '8px solid #0f172a', padding: '1.5rem 1rem 0', boxShadow: 'var(--shadow-xl)', display: 'flex', flexDirection: 'column', position: 'relative', overflow: 'hidden' }}>
                 <div style={{ width: '40px', height: '4px', background: '#e2e8f0', borderRadius: '4px', margin: '0 auto 1.5rem', flexShrink: 0 }}></div>
                 
                 <div style={{ marginBottom: '1.5rem', textAlign: 'center', flexShrink: 0 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Event Materials</h2>
                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Tap a file to view or download</p>
                 </div>

                 {/* Preview Content */}
                 <div style={{ flex: 1, overflowY: 'auto', paddingBottom: '1.5rem', paddingRight: '0.5rem', display: 'flex', flexDirection: 'column' }}>
                    
                    {/* Render Published Announcements */}
                    {announcements.filter(a => a.isPublished).map(ann => (
                      <div key={ann.id} className="animate-scale-in" style={{ background: '#fffbeb', border: '1px solid #fde68a', padding: '1.25rem', borderRadius: '12px', marginBottom: '1rem', color: '#92400e', fontSize: '0.875rem', lineHeight: '1.5', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                         <span style={{ fontWeight: 800, display: 'block', marginBottom: '0.25rem', fontSize: '1rem' }}>📢 Announcement</span>
                         <div style={{ whiteSpace: 'pre-wrap' }}>{ann.text}</div>
                      </div>
                    ))}
                    
                    {/* Render Files */}
                    {files.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8' }}>
                        <FileText size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                        <p style={{ fontSize: '0.875rem' }}>No materials uploaded yet.</p>
                      </div>
                    ) : (
                      files.map(file => (
                        <div key={file.id} style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginBottom: '1rem', background: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
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
                                  <span>Image preview not available</span>
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
                                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', boxSizing: 'border-box', width: '100%', padding: '0.875rem', background: 'var(--color-primary)', color: 'white', borderRadius: '8px', fontWeight: 600, fontSize: '0.875rem', textDecoration: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}
                              >
                                <Download size={18} />
                                Download File
                              </a>
                            </div>
                          )}
                        </div>
                      ))
                    )}
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
