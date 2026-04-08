import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from '../../styles/Landing.module.css';

// Components
import Hero from '../../components/landing/Hero';
import SystemCards from '../../components/landing/SystemCards';
import FeaturesGrid from '../../components/landing/FeaturesGrid';
import HowItWorks from '../../components/landing/HowItWorks';
import Benefits from '../../components/landing/Benefits';

export default function LandingPage() {
  const location = useLocation();

  useEffect(() => {
    // Simple smooth scroll for hash links
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [location]);

  return (
    <div className={styles.pageContainer}>
      <header className={styles.navbar}>
        <div className={styles.logoArea}>
          <div className={styles.logoIcon}>E</div>
          EventFlow
        </div>
        <nav className={styles.navLinks}>
          <a href="#features" className="scale-btn">Features</a>
          <a href="#systems" className="scale-btn">Systems</a>
          <a href="#how-it-works" className="scale-btn">How It Works</a>
          <a href="#benefits" className="scale-btn">Benefits</a>
        </nav>
        <div className={styles.navActions}>
          <Link to="/guest" className="btnOutline scale-btn">Join Event</Link>
          <Link to="/login" className="btnSolid hover-lift scale-btn">Host Login</Link>
        </div>
      </header>
      
      <main>
        <Hero />
        <SystemCards />
        <FeaturesGrid />
        <HowItWorks />
        <Benefits />
      </main>

      {/* Simple Footer */}
      <footer style={{ background: '#0f172a', color: '#94a3b8', padding: '4rem 5%', textAlign: 'center' }}>
         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '1rem', color: 'white', fontWeight: 700 }}>
            <div style={{ background: 'var(--color-primary-light)', width: 24, height: 24, borderRadius: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>E</div>
            EventFlow
         </div>
         <p>© 2026 EventFlow Platform. All rights reserved.</p>
      </footer>
    </div>
  );
}
