import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Trophy, BookOpen, Map, MessageSquare, LogOut } from 'lucide-react';
import { api } from '../../services/api'; 
import styles from '../../styles/Guest.module.css';

const bottomLinks = [
  { path: '/guest', label: 'Home', icon: Home },
  { path: '/guest/brochure', label: 'Brochure', icon: BookOpen },
  { path: '/guest/map', label: 'Map', icon: Map },
  { path: '/guest/tournament', label: 'Tournament', icon: Trophy },
  { path: '/guest/feedback', label: 'Feedback', icon: MessageSquare },
];

export default function GuestLayout() {
  const location = useLocation();
  const [theme, setTheme] = useState({ 
    primary_color: '#1e40af', 
    logo_url: null, 
    background_url: null 
  });

  // Fetch the host's custom settings when the app loads
  useEffect(() => {
    const fetchTheme = async () => {
      try {
        const data = await api.getCustomization();
        if (data) {
          setTheme({
            primary_color: data.primary_color || '#1e40af',
            logo_url: data.logo_url || null,
            background_url: data.background_url || null
          });
        }
      } catch (err) {
        console.error("Failed to load theme:", err);
      }
    };
    fetchTheme();
  }, []);

  // Inject the primary color as a CSS variable so all child pages can use it
  const wrapperStyles = {
    '--theme-primary': theme.primary_color,
  };

  return (
    <div className={styles.guestAppWrapper} style={wrapperStyles}>
      <div className={styles.mobileContainer}>
        {/* Top App Bar */}
        <header className={styles.topAppBar}>
          <div className={styles.appBrand}>
            {/* Display custom logo if it exists, otherwise show default E icon */}
            {theme.logo_url ? (
              <img src={theme.logo_url} alt="Event Logo" style={{ height: '32px', maxWidth: '120px', objectFit: 'contain' }} />
            ) : (
              <>
                <div className={styles.appBrandIcon} style={{ background: theme.primary_color }}>E</div>
                <span style={{ fontWeight: 800, color: '#0f172a' }}>EventFlow</span>
              </>
            )}
          </div>
          <div className={styles.topActions}>
            <Link to="/" className="btnOutline scale-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', gap: '0.25rem', borderColor: '#e2e8f0', background: 'white' }}>
               <LogOut size={14} /> Exit App
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className={styles.mainScrollArea}>
          <Outlet context={{ theme }} /> {/* Pass the theme down to the nested pages! */}
        </main>

        {/* Bottom Navigation */}
        <nav className={styles.bottomNav}>
          {bottomLinks.map((link) => {
            const Icon = link.icon;
            // The Home tab should be active if path exactly matches /guest
            const isActive = link.path === '/guest' 
              ? location.pathname === '/guest' 
              : location.pathname.startsWith(link.path);

            return (
              <Link 
                key={link.path} 
                to={link.path}
                className={`${styles.navItem} ${isActive ? styles.active : ''} scale-btn`}
                // Make the active icon color dynamic!
                style={{ color: isActive ? theme.primary_color : '#94a3b8' }}
              >
                <Icon strokeWidth={isActive ? 2.5 : 2} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}