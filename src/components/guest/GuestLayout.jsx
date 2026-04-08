import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, Trophy, BookOpen, Map, MessageSquare, LogOut } from 'lucide-react';
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

  return (
    <div className={styles.guestAppWrapper}>
      <div className={styles.mobileContainer}>
        {/* Top App Bar */}
        <header className={styles.topAppBar}>
          <div className={styles.appBrand}>
            <div className={styles.appBrandIcon}>E</div>
            EventFlow
          </div>
          <div className={styles.topActions}>
            <Link to="/" className="btnOutline scale-btn" style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', gap: '0.25rem', borderColor: '#e2e8f0', background: 'white' }}>
               <LogOut size={14} /> Exit App
            </Link>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className={styles.mainScrollArea}>
          <Outlet />
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
