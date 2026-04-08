import React, { useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Users, Trophy, BookOpen, Map as MapIcon, Paintbrush, MessageCircle, Share2, LogOut, Bell, Search, Hexagon, CheckCircle2 } from 'lucide-react';
import styles from '../../styles/Host.module.css';

const sidebarLinks = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/dashboard/attendance', label: 'Attendance', icon: Users },
  { path: '/dashboard/tournament', label: 'Tournament', icon: Trophy },
  { path: '/dashboard/brochure', label: 'Brochure', icon: BookOpen },
  { path: '/dashboard/venue-map', label: 'Venue Map', icon: MapIcon },
  { path: '/dashboard/feedback', label: 'Feedback', icon: MessageCircle },
  { path: '/dashboard/customize', label: 'Customize', icon: Paintbrush },
];

export default function HostLayout() {
  const [downloadingQR, setDownloadingQR] = useState(false);
  const [downloadedQR, setDownloadedQR] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const handleDownloadQR = () => {
    setDownloadingQR(true);
    setTimeout(() => {
      setDownloadingQR(false);
      setDownloadedQR(true);
      setTimeout(() => setDownloadedQR(false), 3000);
    }, 1500);
  };

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.sidebarHeader}>
          <div className={styles.sidebarLogo}>
            <div className={styles.sidebarLogoIcon}>E</div>
            EventFlow
          </div>
          <button className={styles.iconBtn}><Hexagon size={18} /></button>
        </div>

        <div className={styles.currentEvent}>
          <div className={styles.currentEventLabel}>CURRENT EVENT</div>
          <div className={styles.currentEventName}>Tech Summit 2026</div>
          <div className={styles.statusIndicator}>
            <div className={styles.statusDot}></div>
            Active
          </div>
        </div>

        <nav style={{ flex: 1, padding: '1.5rem 0', overflowY: 'auto' }}>
          {sidebarLinks.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink 
                key={link.path} 
                to={link.path}
                className="hover-lift scale-btn"
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1rem',
                  padding: '0.75rem 1.5rem',
                  color: isActive ? 'white' : '#94a3b8',
                  background: isActive ? 'var(--color-primary-light)' : 'transparent',
                  borderRight: isActive ? '3px solid white' : 'none',
                  textDecoration: 'none',
                  margin: '0.25rem 0'
                })}
              >
                <Icon size={20} />
                <span style={{ fontWeight: 500 }}>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* QR Code Widget */}
        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
           <div style={{ background: '#1e293b', padding: '1rem', borderRadius: '8px', textAlign: 'center' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#cbd5e1', fontSize: '0.875rem' }}>
               <Share2 size={16} /> Share QR Code
             </div>
             <div style={{ background: 'white', padding: '1rem', borderRadius: '4px', marginBottom: '1rem' }}>
               <div style={{ width: '100px', height: '100px', background: 'repeating-linear-gradient(45deg, #000 0, #000 10%, #fff 0, #fff 50%)', margin: '0 auto'}}></div>
             </div>
             <button 
               onClick={handleDownloadQR}
               disabled={downloadingQR}
               className="scale-btn hover-lift" style={{ 
               width: '100%', padding: '0.75rem', background: downloadedQR ? '#10b981' : 'var(--color-primary-light)', color: 'white', borderRadius: '8px', fontWeight: 600, border: 'none', cursor: downloadingQR ? 'not-allowed' : 'pointer', transition: 'all 0.3s ease', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', opacity: downloadingQR ? 0.8 : 1
             }}>
                {downloadingQR ? (
                  <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>↻</span>
                ) : downloadedQR ? (
                  <CheckCircle2 size={16} />
                ) : null}
                {downloadingQR ? 'Downloading...' : downloadedQR ? 'Downloaded!' : 'Download QR Code'}
             </button>
           </div>
        </div>

        <div style={{ padding: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {/* Back to Home moved to topbar */}
        </div>
      </aside>

      {/* Main Column */}
      <main className={styles.mainArea}>
        {/* Topbar */}
        <header className={styles.topbar} style={{ justifyContent: 'flex-end' }}>
          <div className={styles.topbarActions}>
            <Link to="/" className="btnOutline scale-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'white' }}>
              <LogOut size={16} /> Back to Home
            </Link>
            
            <div style={{ position: 'relative' }}>
              <div 
                className={`${styles.userProfile} hover-lift`} 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title="Account Information"
              >
                H
              </div>
              
              {isProfileOpen && (
                <div className="animate-fade-in" style={{ position: 'absolute', top: 'calc(100% + 0.75rem)', right: 0, width: '220px', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: 'var(--shadow-xl)', overflow: 'hidden', zIndex: 100 }}>
                  <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                    <div style={{ fontWeight: 800, color: 'var(--color-text-main)', fontSize: '0.95rem' }}>Host User</div>
                    <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '0.1rem' }}>host@eventflow.com</div>
                  </div>
                  <div style={{ padding: '0.5rem' }}>
                    <button style={{ width: '100%', display: 'block', padding: '0.75rem 1rem', border: 'none', background: 'transparent', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.875rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#f1f5f9'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                      Account Settings
                    </button>
                    <button style={{ width: '100%', display: 'block', padding: '0.75rem 1rem', border: 'none', background: 'transparent', color: 'var(--color-text-main)', fontWeight: 600, fontSize: '0.875rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#f1f5f9'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                      Billing & Plans
                    </button>
                  </div>
                  <div style={{ padding: '0.5rem', borderTop: '1px solid #e2e8f0' }}>
                    <button style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', border: 'none', background: 'transparent', color: 'var(--color-danger)', fontWeight: 600, fontSize: '0.875rem', borderRadius: '8px', cursor: 'pointer', textAlign: 'left', transition: 'background 0.2s' }} onMouseEnter={(e) => e.target.style.background = '#fef2f2'} onMouseLeave={(e) => e.target.style.background = 'transparent'}>
                      <LogOut size={16} /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content */}
        <div className={styles.contentArea}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
