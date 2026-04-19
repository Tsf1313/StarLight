import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom'; 
import { Trophy, ExternalLink } from 'lucide-react'; // Added ExternalLink icon
import { api } from '../../services/api'; 

const normalizeTournament = (tournament) => {
  const next = { ...tournament };
  const bracketData = next?.bracket_data || {};

  if (Array.isArray(bracketData.rounds)) {
    return next;
  }

  const matches = bracketData.matches || {};
  next.bracket_data = {
    ...bracketData,
    rounds: [
      { name: 'Quarter Finals', matches: [{ id: 'r0m0', ...(matches.q1 || { t1: 'TBD', s1: 0, t2: 'TBD', s2: 0 }) }, { id: 'r0m1', ...(matches.q2 || { t1: 'TBD', s1: 0, t2: 'TBD', s2: 0 }) }] },
      { name: 'Semi Finals', matches: [{ id: 'r1m0', ...(matches.s1 || { t1: 'TBD', s1: 0, t2: 'TBD', s2: 0 }) }] },
      { name: 'Final', matches: [{ id: 'r2m0', ...(matches.f1 || { t1: 'TBD', s1: 0, t2: 'TBD', s2: 0 }) }] },
    ],
  };
  return next;
};

const getTopMatch = (tournament) => tournament?.bracket_data?.rounds?.[0]?.matches?.[0] || null;

const buildStandings = (tournament) => {
  const participants = tournament?.bracket_data?.participants || [];
  return participants
    .map((p, i) => (typeof p === 'string' ? { rank: i + 1, name: p, w: 0, l: 0, pts: 0 } : { rank: i + 1, name: p?.name || `Team ${i + 1}`, w: 0, l: 0, pts: Number(p?.score || 0) }))
    .sort((a, b) => b.pts - a.pts)
    .map((row, i) => ({ ...row, rank: i + 1 }));
};

export default function GuestTournamentPage() {
  const [tournaments, setTournaments] = useState([]);
  const [activeTournamentId, setActiveTournamentId] = useState(null);
  const [activeTab, setActiveTab] = useState('bracket');
  const [schedule, setSchedule] = useState([]);
  
  const { theme } = useOutletContext();

  useEffect(() => {
    const fetchTournaments = async () => {
      const [tournamentsRes, scheduleRes] = await Promise.allSettled([
        api.getGuestTournaments(),
        api.getGuestSchedule(),
      ]);

      if (tournamentsRes.status === 'fulfilled') {
        const data = (Array.isArray(tournamentsRes.value) ? tournamentsRes.value : []).map(normalizeTournament);
        setTournaments(data);
        setActiveTournamentId((prevId) => {
          if (!data.length) return null;
          if (prevId && data.some((t) => String(t.id) === String(prevId))) return prevId;
          return data[0].id;
        });
      } else {
        console.error('Failed to load guest tournaments:', tournamentsRes.reason);
      }

      if (scheduleRes.status === 'fulfilled') {
        setSchedule(Array.isArray(scheduleRes.value) ? scheduleRes.value : []);
      } else {
        console.error('Failed to load guest schedule:', scheduleRes.reason);
      }
    };
    fetchTournaments();
    const intervalId = setInterval(fetchTournaments, 2000);
    return () => clearInterval(intervalId);
  }, []);

  const activeTournament = tournaments.find(t => t.id === activeTournamentId);
  const topMatch = getTopMatch(activeTournament);
  const standings = buildStandings(activeTournament);

  return (
    <div 
      className="animate-fade-in" 
      style={{ 
        padding: '1.25rem', 
        paddingBottom: '2rem',
        minHeight: '100%',
        background: '#f8fafc' 
      }}
    >
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ padding: '0.75rem', background: theme?.primary_color || 'var(--color-primary)', borderRadius: '12px', color: 'white' }}>
          <Trophy size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Tournaments</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Live Brackets & Standings</p>
        </div>
      </div>

      {tournaments.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <Trophy size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '0.875rem' }}>No active tournaments available.</p>
        </div>
      ) : (
        <>
          {/* Tournament Selector */}
          {tournaments.length > 1 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Select Tournament</label>
              <select 
                value={activeTournamentId || ''} 
                onChange={(e) => setActiveTournamentId(e.target.value)} 
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.95rem', fontWeight: 600, color: '#0f172a', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}
              >
                {tournaments.map(t => (
                  <option key={t.id} value={t.id}>{t.name} {t.status === 'Live' ? '🔴' : ''}</option>
                ))}
              </select>
            </div>
          )}

          {activeTournament?.status === 'Live' && activeTournament.preview_type !== 'external' && topMatch && (
            <div style={{ marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '0.875rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.75rem' }}>Current Top Match</h2>
              <div className="hover-lift" style={{ background: 'white', border: `2px solid ${theme?.primary_color || 'var(--color-primary)'}`, borderRadius: '16px', padding: '1.5rem', textAlign: 'center', position: 'relative', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                 <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: theme?.primary_color || 'var(--color-primary)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '99px', fontSize: '0.75rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.375rem', border: '2px solid white' }}>
                   <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} className="animate-pulse"></div>
                   LIVE: {activeTournament.bracket_data?.rounds?.[0]?.name || 'Current Match'}
                 </div>
                 
                 <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{topMatch.t1}</p>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ fontSize: '2.5rem', fontWeight: 800, color: '#0f172a', lineHeight: 1 }}>
                        {topMatch.s1}<span style={{ color: '#cbd5e1', margin: '0 0.5rem' }}>-</span>{topMatch.s2}
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>{topMatch.t2}</p>
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
                style={{ flex: 1, padding: '0.625rem', background: activeTab === 'bracket' ? 'white' : 'transparent', borderRadius: '8px', fontWeight: activeTab === 'bracket' ? 700 : 600, color: activeTab === 'bracket' ? (theme?.primary_color || 'var(--color-primary-dark)') : '#64748b', boxShadow: activeTab === 'bracket' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
             >
                Bracket
             </button>
             <button 
                onClick={() => setActiveTab('standings')}
                className="scale-btn" 
                style={{ flex: 1, padding: '0.625rem', background: activeTab === 'standings' ? 'white' : 'transparent', borderRadius: '8px', fontWeight: activeTab === 'standings' ? 700 : 600, color: activeTab === 'standings' ? (theme?.primary_color || 'var(--color-primary-dark)') : '#64748b', boxShadow: activeTab === 'standings' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
             >
                Standings
             </button>
             <button 
               onClick={() => setActiveTab('schedule')}
               className="scale-btn" 
               style={{ flex: 1, padding: '0.625rem', background: activeTab === 'schedule' ? 'white' : 'transparent', borderRadius: '8px', fontWeight: activeTab === 'schedule' ? 700 : 600, color: activeTab === 'schedule' ? (theme?.primary_color || 'var(--color-primary-dark)') : '#64748b', boxShadow: activeTab === 'schedule' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
             >
               Schedule
             </button>
          </div>

          {activeTab === 'bracket' && activeTournament && (
            activeTournament.preview_type === 'external' ? (
              <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem', minHeight: '300px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>External Tournament Preview</div>
                <div style={{ flex: 1, borderRadius: '18px', overflow: 'hidden', border: '1px solid #cbd5e1', background: 'white', minHeight: '260px' }}>
                  {activeTournament.external_url ? (
                    <iframe
                      src={activeTournament.external_url}
                      title={activeTournament.name}
                      style={{ width: '100%', height: '100%', border: '0' }}
                      loading="lazy"
                    />
                  ) : (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b', fontSize: '0.95rem' }}>No external preview URL set.</div>
                  )}
                </div>
                {activeTournament.external_url && (
                  <button
                    onClick={() => window.open(activeTournament.external_url, '_blank')}
                    className="btnSolid scale-btn"
                    style={{ alignSelf: 'flex-start', padding: '0.9rem 1rem', background: theme?.primary_color || 'var(--color-primary-dark)', color: 'white', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                  >
                    Open Tournament Website <ExternalLink size={16} />
                  </button>
                )}
              </div>
            ) : (
              <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', overflowX: 'auto' }}>
               <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', minWidth: 'max-content' }}>
                {(activeTournament.bracket_data?.rounds || []).map((round, rIdx) => (
                  <div key={rIdx} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                   <div style={{ fontSize: '0.625rem', fontWeight: 800, color: rIdx === (activeTournament.bracket_data.rounds.length - 1) ? (theme?.primary_color || '#f59e0b') : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{round.name}</div>
                   {(round.matches || []).map((m, mIdx) => (
                    <div key={mIdx} style={{ background: 'white', border: rIdx === (activeTournament.bracket_data.rounds.length - 1) ? `2px solid ${theme?.primary_color || '#f59e0b'}` : '1px solid #e2e8f0', borderRadius: '8px', width: '180px', overflow: 'hidden' }}>
                      <div style={{ padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontSize: '0.875rem', fontWeight: Number(m.s1 || 0) > Number(m.s2 || 0) ? 800 : 600 }}><span>{m.t1}</span><span>{m.s1}</span></div>
                      <div style={{ padding: '0.5rem 0.75rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', fontWeight: Number(m.s2 || 0) > Number(m.s1 || 0) ? 800 : 600 }}><span>{m.t2}</span><span>{m.s2}</span></div>
                    </div>
                   ))}
                  </div>
                ))}
               </div>
            </div>
            )
          )}

          {/* NEW LOGIC FOR STANDINGS */}
          {activeTab === 'standings' && activeTournament && (
            activeTournament.preview_type === 'external' ? (
              <div className="animate-fade-in" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '3rem 1.5rem', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                 <Trophy size={40} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
                 <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>External Leaderboard</h3>
                 <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                   Standings and live rankings for this tournament are managed directly on the tournament platform.
                 </p>
                 {activeTournament.external_url && (
                    <button
                      onClick={() => window.open(activeTournament.external_url, '_blank')}
                      className="btnSolid scale-btn"
                      style={{ padding: '0.9rem 1.5rem', background: theme?.primary_color || 'var(--color-primary-dark)', color: 'white', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      View Live Standings <ExternalLink size={16} />
                    </button>
                 )}
              </div>
            ) : (
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
                             <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800, color: theme?.primary_color || 'var(--color-primary-dark)', fontSize: '0.875rem' }}>{team.pts}</td>
                          </tr>
                       ))}
                    </tbody>
                 </table>
              </div>
            )
          )}

          {activeTab === 'schedule' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {schedule.length === 0 ? (
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem', color: '#64748b' }}>No schedule available for this event.</div>
              ) : (
                schedule.map((item) => (
                  <div key={item.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem' }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{item.location || '-'} | {item.time}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}