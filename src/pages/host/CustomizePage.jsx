import React, { useState, useEffect, useRef } from 'react';
import { Palette, Image as ImageIcon, CheckCircle2, Upload, Trash2, Smartphone } from 'lucide-react';
import { api } from '../../services/api'; // Make sure this path is correct for your structure

export default function CustomizePage() {
  const [primaryColor, setPrimaryColor] = useState('#1e40af');
  
  // States for live previews (Base64 strings or DB URLs)
  const [logoPreview, setLogoPreview] = useState(null);
  const [bgPreview, setBgPreview] = useState(null);
  
  // States to hold the actual physical files for Multer
  const [logoFile, setLogoFile] = useState(null);
  const [bgFile, setBgFile] = useState(null);
  
  // States to remember what is currently saved in the database
  const [existingLogoUrl, setExistingLogoUrl] = useState(null);
  const [existingBgUrl, setExistingBgUrl] = useState(null);

  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  
  const logoInputRef = useRef(null);
  const bgInputRef = useRef(null);

  const colorPresets = [
    { name: 'Primary (Blue)', hex: '#1e40af' },
    { name: 'Success (Green)', hex: '#10b981' },
    { name: 'Accent (Purple)', hex: '#8b5cf6' },
    { name: 'Dark (Slate)', hex: '#0f172a' }
  ];

  // 1. Fetch saved settings when the page loads
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const data = await api.getCustomization();
        if (data) {
          if (data.primary_color) setPrimaryColor(data.primary_color);
          if (data.logo_url) {
            setLogoPreview(data.logo_url);
            setExistingLogoUrl(data.logo_url);
          }
          if (data.background_url) {
            setBgPreview(data.background_url);
            setExistingBgUrl(data.background_url);
          }
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    loadSettings();
  }, []);

  // 2. Handle File Selection (Save both the Preview and the physical File)
  const handleFileChange = (e, setPreview, setFile) => {
    const file = e.target.files[0];
    if (file) {
      setFile(file); // Save physical file for Multer
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result); // Save Base64 for instant UI preview
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setLogoFile(null);
  };

  const handleRemoveBg = () => {
    setBgPreview(null);
    setBgFile(null);
  };

  // 3. The Publish Sequence
  const handlePublish = async () => {
    setIsPublishing(true);
    
    try {
      let finalLogoUrl = logoPreview ? existingLogoUrl : null;
      let finalBgUrl = bgPreview ? existingBgUrl : null;

      // If a new Logo was selected, upload it first
      if (logoFile) {
         const logoRes = await api.uploadImage(logoFile);
         finalLogoUrl = logoRes.url;
         setExistingLogoUrl(finalLogoUrl);
         setLogoFile(null); // Clear pending file
      }

      // If a new Background was selected, upload it first
      if (bgFile) {
         const bgRes = await api.uploadImage(bgFile);
         finalBgUrl = bgRes.url;
         setExistingBgUrl(finalBgUrl);
         setBgFile(null); // Clear pending file
      }

      // Save everything to SQLite
      await api.updateCustomization({
        primary_color: primaryColor,
        theme_name: 'light',
        logo_url: finalLogoUrl,
        background_url: finalBgUrl
      });

      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
    } catch (err) {
      alert('Failed to publish theme: ' + err.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const currentThemeHex = primaryColor;

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexShrink: 0 }}>
        <div>
           <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: '#0f172a' }}>Theme Customization</h1>
           <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Design the visual experience of the participant web app.</p>
        </div>
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
           {isPublishing ? 'Publishing...' : published ? 'Published!' : 'Publish Theme'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '2rem', flex: 1, minHeight: 0 }}>
        {/* Settings Panel */}
        <div style={{ flex: '1.2', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflowY: 'auto', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
           
           {/* Colors Section */}
           <div style={{ padding: '2rem', borderBottom: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ background: '#eff6ff', padding: '0.5rem', borderRadius: '8px' }}>
                  <Palette size={20} color="#3b82f6" />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Colors</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>Select a predefined color or pick a custom one to theme the guest app.</p>
              
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '1rem' }}>
                 {colorPresets.map((c, i) => (
                    <div 
                      key={i} 
                      onClick={() => setPrimaryColor(c.hex)}
                      className="hover-lift" 
                      style={{ 
                        border: primaryColor === c.hex ? `2px solid ${c.hex}` : '1px solid #e2e8f0', 
                        borderRadius: '12px', 
                        padding: '0.5rem', 
                        cursor: 'pointer', 
                        position: 'relative',
                        background: primaryColor === c.hex ? '#f8fafc' : 'white',
                        transition: 'all 0.2s'
                      }}>
                       {primaryColor === c.hex && (
                         <div style={{ position: 'absolute', top: -8, right: -8, background: 'white', borderRadius: '50%' }}>
                           <CheckCircle2 size={24} color={c.hex} fill="white" />
                         </div>
                       )}
                       <div style={{ width: '100%', height: '48px', background: c.hex, borderRadius: '8px', marginBottom: '0.75rem', boxShadow: 'inner 0 2px 4px 0 rgba(0,0,0,0.05)' }}></div>
                       <div style={{ fontSize: '0.75rem', fontWeight: 600, textAlign: 'center', color: '#334155' }}>{c.name}</div>
                    </div>
                 ))}
                 
                 {/* Custom Color Input */}
                 <label 
                   className="hover-lift" 
                   style={{ 
                     border: !colorPresets.find(p => p.hex === primaryColor) ? `2px solid ${primaryColor}` : '1px dashed #cbd5e1', 
                     borderRadius: '12px', 
                     padding: '0.5rem', 
                     display: 'flex', 
                     flexDirection: 'column', 
                     alignItems: 'center', 
                     justifyContent: 'center', 
                     color: '#64748b', 
                     cursor: 'pointer',
                     background: !colorPresets.find(p => p.hex === primaryColor) ? '#f8fafc' : 'white',
                     position: 'relative'
                   }}>
                    {!colorPresets.find(p => p.hex === primaryColor) && (
                         <div style={{ position: 'absolute', top: -8, right: -8, background: 'white', borderRadius: '50%' }}>
                           <CheckCircle2 size={24} color={primaryColor} fill="white" />
                         </div>
                    )}
                    <input 
                      type="color" 
                      value={primaryColor} 
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      style={{ opacity: 0, position: 'absolute', inset: 0, width: '100%', height: '100%', cursor: 'pointer' }}
                    />
                    <div style={{ width: '100%', height: '48px', background: !colorPresets.find(p => p.hex === primaryColor) ? primaryColor : '#f1f5f9', borderRadius: '8px', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                       <Palette size={20} color={!colorPresets.find(p => p.hex === primaryColor) ? 'white' : '#94a3b8'} />
                    </div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>Custom</div>
                 </label>
              </div>
           </div>

           {/* Imagery Section */}
           <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <div style={{ background: '#f5f3ff', padding: '0.5rem', borderRadius: '8px' }}>
                  <ImageIcon size={20} color="#8b5cf6" />
                </div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#0f172a' }}>Imagery & Logos</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1.5rem' }}>Upload your event logo and background images for the landing screen.</p>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                 {/* Event Logo Upload */}
                 <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                      Event Logo
                      {logoPreview && (
                        <button onClick={handleRemoveLogo} className="hover-lift" style={{ color: '#ef4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={logoInputRef} 
                      style={{ display: 'none' }} 
                      onChange={(e) => handleFileChange(e, setLogoPreview, setLogoFile)}
                    />
                    
                    {!logoPreview ? (
                      <div 
                        onClick={() => logoInputRef.current.click()}
                        style={{ border: '2px dashed #cbd5e1', background: '#f8fafc', padding: '2.5rem 1rem', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }} 
                        className="hover-lift"
                      >
                         <div style={{ background: 'white', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                           <Upload size={20} color="#64748b" />
                         </div>
                         <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Click to upload logo</div>
                         <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>PNG, JPG or SVG (Max 2MB)</div>
                      </div>
                    ) : (
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', position: 'relative' }}>
                        <img src={logoPreview} alt="Logo Preview" style={{ maxHeight: '100px', maxWidth: '100%', objectFit: 'contain' }} />
                      </div>
                    )}
                 </div>

                 {/* Background Image Upload */}
                 <div>
                    <label style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', color: '#334155' }}>
                      Background Image (Optional)
                      {bgPreview && (
                        <button onClick={handleRemoveBg} className="hover-lift" style={{ color: '#ef4444', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                          <Trash2 size={14} /> Remove
                        </button>
                      )}
                    </label>
                    <input 
                      type="file" 
                      accept="image/*" 
                      ref={bgInputRef} 
                      style={{ display: 'none' }} 
                      onChange={(e) => handleFileChange(e, setBgPreview, setBgFile)}
                    />
                    
                    {!bgPreview ? (
                      <div 
                        onClick={() => bgInputRef.current.click()}
                        style={{ border: '2px dashed #cbd5e1', background: '#f8fafc', padding: '2.5rem 1rem', borderRadius: '12px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }} 
                        className="hover-lift"
                      >
                         <div style={{ background: 'white', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                           <ImageIcon size={20} color="#64748b" />
                         </div>
                         <div style={{ fontWeight: 600, color: '#334155', marginBottom: '0.25rem' }}>Click to upload background pattern</div>
                         <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>1080x1920px recommended</div>
                      </div>
                    ) : (
                      <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', background: '#f8fafc', position: 'relative', height: '160px' }}>
                        <img src={bgPreview} alt="Background Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </div>
                    )}
                 </div>
              </div>
           </div>
        </div>

        {/* Live Preview Pane */}
        <div style={{ flex: '1', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
           <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
             <Smartphone size={18} color="#64748b" />
             <h3 style={{ fontWeight: 600, fontSize: '0.875rem', color: '#475569' }}>Live Guest App Preview</h3>
           </div>
           
           <div style={{ flex: 1, background: '#f1f5f9', padding: '2rem', display: 'flex', justifyContent: 'center', overflowY: 'auto' }}>
              <div 
                style={{ 
                  width: '320px', 
                  minHeight: '640px', 
                  background: bgPreview ? `url(${bgPreview}) center/cover no-repeat` : '#f8fafc', 
                  borderRadius: '36px', 
                  border: '10px solid #0f172a', 
                  overflow: 'hidden', 
                  display: 'flex', 
                  flexDirection: 'column', 
                  boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                  position: 'relative'
                }}
              >
                 {bgPreview && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)', zIndex: 0 }}></div>}
                 
                 {/* Top Status Bar (Fake) */}
                 <div style={{ height: '24px', position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', paddingTop: '8px' }}>
                    <div style={{ width: '60px', height: '6px', background: '#e2e8f0', borderRadius: '4px' }}></div>
                 </div>

                 {/* Mock Guest View content */}
                 <div style={{ padding: '1.25rem', position: 'relative', zIndex: 1, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Header Area */}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem', marginTop: '0.5rem' }}>
                       {logoPreview ? (
                         <img src={logoPreview} alt="Logo" style={{ maxHeight: '48px', maxWidth: '80%', objectFit: 'contain' }} />
                       ) : (
                         <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, fontSize: '1.25rem', color: '#0f172a' }}>
                           <div style={{ background: currentThemeHex, width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                             <span style={{ color: 'white', fontSize: '1rem' }}>E</span>
                           </div> 
                           Tech Summit
                         </div>
                       )}
                    </div>

                    {/* Main Banner */}
                    <div style={{ background: currentThemeHex, borderRadius: '16px', padding: '1.5rem', color: 'white', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: '160px', marginBottom: '1.5rem', boxShadow: `0 10px 15px -3px ${currentThemeHex}40`, transition: 'all 0.3s' }}>
                       <div>
                         <div style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.8, marginBottom: '0.25rem', fontWeight: 600 }}>Welcome to</div>
                         <h2 style={{ fontSize: '1.5rem', fontWeight: 800, lineHeight: 1.2 }}>Tech Summit 2026</h2>
                       </div>
                       <div style={{ fontSize: '0.875rem', opacity: 0.9, fontWeight: 500 }}>
                         Oct 15 - Oct 17 • Main Hall
                       </div>
                    </div>

                    {/* Actions Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1.5rem' }}>
                       <div className="hover-lift" style={{ background: 'white', border: 'none', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${currentThemeHex}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 16, height: 16, background: currentThemeHex, borderRadius: '4px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>Schedule</span>
                       </div>
                       <div className="hover-lift" style={{ background: 'white', border: 'none', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', cursor: 'pointer' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: `${currentThemeHex}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <div style={{ width: 16, height: 16, background: currentThemeHex, borderRadius: '4px' }}></div>
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#334155' }}>Speakers</span>
                       </div>
                    </div>

                    {/* Announcement Card */}
                    <div style={{ background: 'white', borderRadius: '12px', padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', borderLeft: `4px solid ${currentThemeHex}` }}>
                      <div style={{ fontSize: '0.7rem', fontWeight: 800, color: currentThemeHex, marginBottom: '0.25rem', letterSpacing: '0.05em' }}>LATEST UPDATE</div>
                      <div style={{ fontSize: '0.875rem', color: '#1e293b', fontWeight: 500, lineHeight: 1.4 }}>Keynote speech starting in 15 mins at Stage A. Please take your seats.</div>
                    </div>
                 </div>

                 {/* Bottom Navigation */}
                 <div style={{ height: '64px', background: 'white', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-around', alignItems: 'center', position: 'relative', zIndex: 1, borderBottomLeftRadius: '26px', borderBottomRightRadius: '26px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: currentThemeHex, cursor: 'pointer' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '6px', background: currentThemeHex, opacity: 1 }}></div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 700 }}>Home</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '6px', background: '#cbd5e1' }}></div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Map</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', color: '#94a3b8', cursor: 'pointer', transition: 'color 0.2s' }}>
                      <div style={{ width: 20, height: 20, borderRadius: '6px', background: '#cbd5e1' }}></div>
                      <span style={{ fontSize: '0.65rem', fontWeight: 600 }}>Profile</span>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}