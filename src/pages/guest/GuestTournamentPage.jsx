import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom'; 
import { Trophy, ExternalLink } from 'lucide-react';
import { api } from '../../services/api'; 

export default function GuestTournamentPage() {
  const [tournaments, setTournaments] = useState([]);
  const [activeTournamentId, setActiveTournamentId] = useState(null);
  const [activeTab, setActiveTab] = useState('bracket');
  const [schedule, setSchedule] = useState([]);
  
  const { theme } = useOutletContext();

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const [data, scheduleRows] = await Promise.all([
          api.getGuestTournaments(),
          api.getGuestSchedule(),
        ]);
        
        // Normalize old bracket data if needed
        const normalizedData = data.map(t => {
           if (t.format === 'bracket' && t.preview_type !== 'external') {
              if (t.bracket_data && t.bracket_data.matches && !t.bracket_data.rounds) {
                 return {
                    ...t,
                    bracket_data: {
                       participants: t.bracket_data.participants || [],
                       rounds: [
                          { name: 'Quarter Finals', matches: [t.bracket_data.matches.q1, t.bracket_data.matches.q2].filter(Boolean) },
                          { name: 'Semi Finals', matches: [t.bracket_data.matches.s1].filter(Boolean) },
                          { name: 'Final', matches: [t.bracket_data.matches.f1].filter(Boolean) }
                       ]
                    }
                 }
              }
           }
           return t;
        });

        setTournaments(normalizedData);
        setSchedule(scheduleRows);
        if (normalizedData.length > 0 && !activeTournamentId) {
          setActiveTournamentId(normalizedData[0].id);
        }
      } catch (err) {
        console.error("Failed to load tournaments:", err);
      }
    };
    
    fetchTournaments();
    const intervalId = setInterval(fetchTournaments, 5000);
    return () => clearInterval(intervalId);
  }, [activeTournamentId]);

  const activeTournament = tournaments.find(t => t.id === activeTournamentId);
  
  // Calculate dynamic standings for sequential tournaments
  const sequentialStandings = activeTournament?.format === 'sequential' && activeTournament.bracket_data?.participants
    ? [...activeTournament.bracket_data.participants].sort((a, b) => (b.score || 0) - (a.score || 0))
    : [];

  // Calculate dynamic standings for bracket tournaments
  let bracketStandings = [];
  if (activeTournament?.format === 'bracket' && activeTournament.bracket_data?.rounds) {
    const teamStats = {};
    const rounds = activeTournament.bracket_data.rounds;
    
    // Loop through all rounds to find the highest round each team reached
    rounds.forEach((round, rIdx) => {
      round.matches.forEach(m => {
        if (m.t1 && m.t1 !== 'TBD' && m.t1 !== 'BYE') {
          teamStats[m.t1] = { name: m.t1, roundIdx: rIdx, roundName: round.name, isWinner: m.winner === m.t1 };
        }
        if (m.t2 && m.t2 !== 'TBD' && m.t2 !== 'BYE') {
          teamStats[m.t2] = { name: m.t2, roundIdx: rIdx, roundName: round.name, isWinner: m.winner === m.t2 };
        }
      });
    });

    // Sort by farthest round reached, then by winner, then alphabetically
    bracketStandings = Object.values(teamStats).sort((a, b) => {
      if (a.roundIdx !== b.roundIdx) return b.roundIdx - a.roundIdx;
      if (a.isWinner !== b.isWinner) return a.isWinner ? -1 : 1;
      return a.name.localeCompare(b.name);
    }).map((team, index) => {
       let placement = `Reached ${team.roundName}`;
       // If they reached the final round, classify as Champion or Runner-Up
       if (team.roundIdx === rounds.length - 1) {
          placement = team.isWinner ? 'Champion 🏆' : 'Runner-Up';
       }
       return { ...team, placement, rank: index + 1 };
    });
  }

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

          {/* Segmented Control */}
          <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '10px', padding: '0.25rem', marginBottom: '1.5rem' }}>
             <button 
                onClick={() => setActiveTab('bracket')}
                className="scale-btn" 
                style={{ flex: 1, padding: '0.625rem', background: activeTab === 'bracket' ? 'white' : 'transparent', borderRadius: '8px', fontWeight: activeTab === 'bracket' ? 700 : 600, color: activeTab === 'bracket' ? (theme?.primary_color || 'var(--color-primary-dark)') : '#64748b', boxShadow: activeTab === 'bracket' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
             >
                {activeTournament?.format === 'sequential' ? 'Overview' : 'Bracket'}
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
            ) : activeTournament.format === 'bracket' ? (
              <div style={{ background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', overflowX: 'auto' }}>
                 <div style={{ display: 'flex', gap: '3rem', alignItems: 'center', minWidth: 'max-content' }}>
                    {activeTournament.bracket_data?.rounds?.map((round, rIdx) => (
                       <div key={rIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: '200px', justifyContent: 'center' }}>
                         <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'center' }}>{round.name}</div>
                         {round.matches.map((m, mIdx) => {
                           const isT1Winner = m.winner && m.winner === m.t1 && m.t1 !== 'TBD' && m.t1 !== 'BYE';
                           const isT2Winner = m.winner && m.winner === m.t2 && m.t2 !== 'TBD' && m.t2 !== 'BYE';
                           
                           return (
                            <div key={mIdx} className="hover-lift" style={{ background: 'white', border: rIdx === activeTournament.bracket_data.rounds.length - 1 ? `2px solid ${theme?.primary_color || '#f59e0b'}` : '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                               <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', fontWeight: isT1Winner ? 800 : 500, color: isT1Winner ? 'var(--color-text-main)' : '#64748b', background: isT1Winner ? '#eff6ff' : '#f8fafc', borderLeft: isT1Winner ? `4px solid ${theme?.primary_color || 'var(--color-primary-main)'}` : '4px solid transparent', transition: 'all 0.2s' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{m.t1} {isT1Winner && <Trophy size={14} style={{ color: theme?.primary_color || 'var(--color-primary-main)' }} />}</div>
                               </div>
                               <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: isT2Winner ? 800 : 500, color: isT2Winner ? 'var(--color-text-main)' : '#64748b', background: isT2Winner ? '#eff6ff' : '#f8fafc', borderLeft: isT2Winner ? `4px solid ${theme?.primary_color || 'var(--color-primary-main)'}` : '4px solid transparent', transition: 'all 0.2s' }}>
                                 <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{m.t2} {isT2Winner && <Trophy size={14} style={{ color: theme?.primary_color || 'var(--color-primary-main)' }} />}</div>
                               </div>
                            </div>
                         )})}
                       </div>
                    ))}
                 </div>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                 <Trophy size={40} style={{ margin: '0 auto 1rem', color: '#cbd5e1' }} />
                 <h3 style={{ fontSize: '1.125rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>Sequential Tournament</h3>
                 <p>This tournament uses a sequential format. Please check the <b>Standings</b> tab to view the current leaderboard.</p>
              </div>
            )
          )}

          {/* STANDINGS TAB */}
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
            ) : activeTournament.format === 'sequential' ? (
              <div className="animate-fade-in" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.625rem', textTransform: 'uppercase' }}>
                       <tr>
                          <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Rank</th>
                          <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Participant</th>
                          <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'center' }}>Points</th>
                       </tr>
                    </thead>
                    <tbody>
                       {sequentialStandings.length > 0 ? sequentialStandings.map((team, i) => (
                          <tr key={i} style={{ borderTop: '1px solid #e2e8f0' }} className="hover-lift">
                             <td style={{ padding: '1rem', fontWeight: 700, color: i === 0 ? 'var(--color-warning)' : '#94a3b8', fontSize: '0.875rem' }}>
                                #{i + 1}
                             </td>
                             <td style={{ padding: '1rem', fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{team.name}</td>
                             <td style={{ padding: '1rem', textAlign: 'center', fontWeight: 800, color: theme?.primary_color || 'var(--color-primary-dark)', fontSize: '0.875rem' }}>{team.score || 0}</td>
                          </tr>
                       )) : (
                          <tr>
                             <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No participants added yet.</td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
            ) : (
              <div className="animate-fade-in" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                 <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.625rem', textTransform: 'uppercase' }}>
                       <tr>
                          <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Rank</th>
                          <th style={{ padding: '0.75rem 1rem', fontWeight: 700 }}>Team</th>
                          <th style={{ padding: '0.75rem 1rem', fontWeight: 700, textAlign: 'right' }}>Placement</th>
                       </tr>
                    </thead>
                    <tbody>
                       {bracketStandings.length > 0 ? bracketStandings.map((team, i) => (
                          <tr key={i} style={{ borderTop: '1px solid #e2e8f0', background: team.placement.includes('Champion') ? '#fffbeb' : 'transparent' }} className="hover-lift">
                             <td style={{ padding: '1rem', fontWeight: 700, color: i === 0 ? 'var(--color-warning)' : '#94a3b8', fontSize: '0.875rem' }}>
                                #{team.rank}
                             </td>
                             <td style={{ padding: '1rem', fontWeight: 700, color: '#0f172a', fontSize: '0.875rem' }}>{team.name}</td>
                             <td style={{ padding: '1rem', textAlign: 'right', fontWeight: team.placement.includes('Champion') ? 800 : 600, color: team.placement.includes('Champion') ? '#f59e0b' : '#64748b', fontSize: '0.875rem' }}>
                                {team.placement}
                             </td>
                          </tr>
                       )) : (
                          <tr>
                             <td colSpan="3" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>No matches played yet.</td>
                          </tr>
                       )}
                    </tbody>
                 </table>
              </div>
            )
          )}

          {activeTab === 'schedule' && (
            <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {schedule.length === 0 ? (
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.5rem', color: '#64748b', textAlign: 'center' }}>No schedule available for this event.</div>
              ) : (
                schedule.map((item) => (
                  <div key={item.id} style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1rem', borderLeft: `4px solid ${theme?.primary_color || 'var(--color-primary)'}` }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700 }}>{item.time}</span>
                      <span>•</span>
                      <span>{item.location || 'TBA'}</span>
                    </div>
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