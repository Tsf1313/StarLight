import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom'; // NEW: Hook to catch the theme
import { Trophy } from 'lucide-react';
import { initialTournaments, guestTournamentData } from '../../data/mockData';

export default function GuestTournamentPage() {
  const [activeTournamentId, setActiveTournamentId] = useState(initialTournaments.length > 0 ? initialTournaments[0].id : null);
  const [activeTab, setActiveTab] = useState('bracket');
  
  // Catch the custom theme passed down from GuestLayout
  const { theme } = useOutletContext();

  const activeTournament = initialTournaments.find(t => t.id === activeTournamentId);
  const { liveMatch, standings } = guestTournamentData;

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
          <Trophy size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Tournaments</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Live Brackets & Standings</p>
        </div>
      </div>

      {initialTournaments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <Trophy size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '0.875rem' }}>No active tournaments available.</p>
        </div>
      ) : (
        <>
          {/* Tournament Selector */}
          {initialTournaments.length > 1 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Select Tournament</label>
              <select 
                value={activeTournamentId} 
                onChange={(e) => setActiveTournamentId(Number(e.target.value))}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              >
                {initialTournaments.map(t => (
                  <option key={t.id} value={t.id}>{t.name} {t.status === 'Live' ? '🔴' : ''}</option>
                ))}
              </select>
            </div>
          )}

          {activeTournament?.status === 'Live' && activeTournament.previewType !== 'external' && activeTournament.matches?.q1 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Current Top Match</h2>
              {/* Dynamic primary color for Live Match border */}
              <div className="hover-lift" style={{ background: 'white', border: `2px solid ${theme?.primary_color || 'var(--color-primary)'}`, borderRadius: '16px', padding: '1.5rem', textAlign: 'center', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                 <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: theme?.primary_color || 'var(--color-primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.375rem', border: '2px solid white' }}>
                   <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} className="animate-pulse"></div>
                   LIVE: {liveMatch.round}
                 </div>
                 
                 <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{activeTournament.matches.q1.t1}</p>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                        {activeTournament.matches.q1.s1}<span style={{ color: '#cbd5e1', margin: '0 0.5rem' }}>-</span>{activeTournament.matches.q1.s2}
                      </div>
                    </div>

                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{activeTournament.matches.q1.t2}</p>
                    </div>
                 </div>
              </div>
            </div>
          )}

          {/* Segmented Control */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '0.25rem', marginBottom: '1.5rem' }}>
             <button 
                onClick={() => setActiveTab('bracket')}
                className="scale-btn" 
                // Dynamic active tab text color
                style={{ flex: 1, padding: '0.625rem', background: activeTab === 'bracket' ? 'white' : 'transparent', borderRadius: '8px', fontWeight: activeTab === 'bracket' ? 700 : 600, color: activeTab === 'bracket' ? (theme?.primary_color || 'var(--color-primary-dark)') : '#64748b', boxShadow: activeTab === 'bracket' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
             >
                Bracket
             </button>
             <button 
                onClick={() => setActiveTab('standings')}
                className="scale-btn" 
                 // Dynamic active tab text color
                style={{ flex: 1, padding: '0.625rem', background: activeTab === 'standings' ? 'white' : 'transparent', borderRadius: '8px', fontWeight: activeTab === 'standings' ? 700 : 600, color: activeTab === 'standings' ? (theme?.primary_color || 'var(--color-primary-dark)') : '#64748b', boxShadow: activeTab === 'standings' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
             >
                Standings
             </button>
          </div>

          {activeTab === 'bracket' && activeTournament && (
            activeTournament.previewType === 'external' ? (
              <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '300px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>External Tournament Preview</div>
                <div style={{ flex: 1, borderRadius: '18px', overflow: 'hidden', border: '1px solid #cbd5e1', background: 'white', minHeight: '260px' }}>
                  {activeTournament.externalUrl ? (
                    <iframe
                      src={activeTournament.externalUrl}
                      title={activeTournament.name}
                      style={{ width: '100%', height: '100%', border: '0' }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.95rem' }}>No external preview URL set.</div>
                  )}
                </div>
                {activeTournament.externalUrl && (
                  <button
                    onClick={() => window.open(activeTournament.externalUrl, '_blank')}
                    className="btnSolid scale-btn"
                    style={{ alignSelf: 'flex-start', padding: '0.9rem 1rem', background: theme?.primary_color || 'var(--color-primary-dark)', color: 'white' }}
                  >
                    Open Tournament Website
                  </button>
                )}
              </div>
            ) : (
              <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', overflowX: 'auto' }}>
                 <div style={{ display: 'flex', gap: '2rem', alignItems: 'center', minWidth: 'max-content' }}>
                    
                    {/* Quarter Finals */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                       <div style={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quarter Finals</div>
                       <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', width: '160px', overflow: 'hidden' }}>
                          <div style={{ padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem', fontWeight: 600 }}><span>{activeTournament.matches.q1.t1}</span><span>{activeTournament.matches.q1.s1}</span></div>
                          <div style={{ padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600 }}><span>{activeTournament.matches.q1.t2}</span><span>{activeTournament.matches.q1.s2}</span></div>
                       </div>
                       <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', width: '160px', overflow: 'hidden' }}>
                          <div style={{ padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem', fontWeight: 600 }}><span>{activeTournament.matches.q2.t1}</span><span>{activeTournament.matches.q2.s1}</span></div>
                          <div style={{ padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600 }}><span>{activeTournament.matches.q2.t2}</span><span>{activeTournament.matches.q2.s2}</span></div>
                       </div>
                    </div>
                    
                    {/* Semi Finals */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                       <div style={{ position: 'absolute', left: '-1rem', top: '35%', width: '1rem', height: '1px', background: '#cbd5e1' }}></div>
                       <div style={{ position: 'absolute', left: '-1rem', bottom: '35%', width: '1rem', height: '1px', background: '#cbd5e1' }}></div>
                       <div style={{ position: 'absolute', left: '-1rem', top: '35%', width: '1px', height: '30%', background: '#cbd5e1' }}></div>
                       
                       <div style={{ fontSize: '0.625rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Semi Finals</div>
                       <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', width: '160px', overflow: 'hidden' }}>
                          <div style={{ padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem', fontWeight: 600 }}><span>{activeTournament.matches.s1.t1}</span><span>{activeTournament.matches.s1.s1}</span></div>
                          <div style={{ padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600 }}><span>{activeTournament.matches.s1.t2}</span><span>{activeTournament.matches.s1.s2}</span></div>
                       </div>
                    </div>

                    {/* Final */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative' }}>
                       <div style={{ position: 'absolute', left: '-1rem', top: '55%', width: '1rem', height: '1px', background: '#cbd5e1' }}></div>
                       
                       {/* Final Match border dynamically colored */}
                       <div style={{ fontSize: '0.625rem', fontWeight: 800, color: theme?.primary_color || '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Final</div>
                       <div style={{ background: 'white', border: `2px solid ${theme?.primary_color || '#f59e0b'}`, borderRadius: '8px', width: '160px', overflow: 'hidden' }}>
                          <div style={{ padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #fef3c7', fontSize: '0.875rem', fontWeight: 800, background: `${theme?.primary_color || '#f59e0b'}15` }}><span>{activeTournament.matches.f1.t1}</span><span>{activeTournament.matches.f1.s1}</span></div>
                          <div style={{ padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: 600 }}><span>{activeTournament.matches.f1.t2}</span><span>{activeTournament.matches.f1.s2}</span></div>
                       </div>
                    </div>
                 </div>
            </div>
            )
          )}

          {activeTab === 'standings' && (
            <div className="animate-fade-in" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.625rem', textTransform: 'uppercase' }}>
                     <tr>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Rank</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Team</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'center' }}>W-L</th>
                        <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'center' }}>Pts</th>
                     </tr>
                  </thead>
                  <tbody>
                     {standings.map((team, i) => (
                        <tr key={i} style={{ borderTop: '1px solid #e2e8f0' }} className="hover-lift">
                           <td style={{ padding: '1rem', fontWeight: 700, color: i === 0 ? 'var(--color-warning)' : '#94a3b8', fontSize: '0.875rem' }}>
                              #{team.rank}
                           </td>
                           <td style={{ padding: '1rem', fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{team.name}</td>
                           <td style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontWeight: 500, fontSize: '0.875rem' }}>{team.w}-{team.l}</td>
                           {/* Dynamic primary color for Points */}
                           <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800, color: theme?.primary_color || 'var(--color-primary-dark)', fontSize: '0.875rem' }}>{team.pts}</td>
                        </tr>
                     ))}
                  </tbody>
               </table>
            </div>
          )}

        </>
      )}
    </div>
  );
}