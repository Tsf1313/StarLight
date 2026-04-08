import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, QrCode, CheckCircle } from 'lucide-react';
import styles from '../../styles/Landing.module.css';

export default function Hero() {
  return (
    <section className={`${styles.hero} animate-fade-in`}>
      <div className={`${styles.heroBadge} animate-slide-up`} style={{ animationDelay: '0.1s' }}>
        <div className={styles.heroBadgeDot} className="animate-pulse"></div>
        All-in-One Event Management
      </div>
      
      <h1 className={`${styles.heroTitle} animate-slide-up`} style={{ animationDelay: '0.2s' }}>
        Simplify Your <span>Event Planning</span>
      </h1>
      
      <p className={`${styles.heroDesc} animate-slide-up`} style={{ animationDelay: '0.3s' }}>
        Combine attendance tracking, tournament management, digital brochures, and venue maps — all in one powerful platform.
      </p>
      
      <div className={`${styles.heroActions} animate-slide-up`} style={{ animationDelay: '0.4s' }}>
        <Link to="/register" className={`${styles.btnHeroPrimary} scale-btn`}>
          Get Started as Host <ArrowRight size={20} />
        </Link>
        <Link to="/guest" className={`${styles.btnHeroSecondary} scale-btn`}>
          <QrCode size={20} /> Scan QR to Join
        </Link>
      </div>
      
      <div className={`${styles.heroStats} animate-slide-up`} style={{ animationDelay: '0.5s' }}>
        <div className={styles.statItem}>
          <CheckCircle size={18} />
          <span>500+ Events</span>
        </div>
        <div className={styles.statItem}>
          <CheckCircle size={18} />
          <span>10K+ Participants</span>
        </div>
        <div className={styles.statItem}>
          <CheckCircle size={18} />
          <span>99.9% Uptime</span>
        </div>
      </div>
    </section>
  );
}
