import React, { useState } from 'react';
import { Trophy, Clock, Plus, Edit, X, ChevronDown } from 'lucide-react';

import { initialTournaments } from '../../data/mockData';

export default function TournamentPage() {
  const [activeTab, setActiveTab] = useState('bracket');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [tournaments, setTournaments] = useState(initialTournaments);
  const [activeTournamentId, setActiveTournamentId] = useState(initialTournaments[0].id);
  const activeTournament = tournaments.find(t => t.id === activeTournamentId) || tournaments[0];
  const isExternalTournament = activeTournament?.previewType === 'external';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);

  const [tournamentForm, setTournamentForm] = useState({
    name: '',
    participants: '',
    format: 'bracket',
    previewType: 'bracket',
    externalUrl: ''
  });

  const handleEditClick = () => {
    setEditForm(JSON.parse(JSON.stringify(activeTournament)));
    setIsEditModalOpen(true);
  };

  const handleEditSave = (e) => {
    e.preventDefault();
    setTournaments(tournaments.map(t => t.id === editForm.id ? editForm : t));
    setIsEditModalOpen(false);
    alert('Tournament settings updated successfully!');
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
           <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>Tournament Management</h1>
           <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage brackets, scores, and standings.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
           <button 
             onClick={() => setIsModalOpen(true)}
             className="btnSolid scale-btn hover-lift" 
             style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
           >
              <Plus size={16} /> New Tournament
           </button>
        </div>
      </div>

      {/* Top Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
         {[
           { label: 'Active Tournaments', val: tournaments.filter(t => t.status === 'Live').length, icon: Trophy, color: '#f59e0b', bg: '#fffbeb' },
           { label: 'Upcoming Matches', val: 4, icon: Clock, color: '#8b5cf6', bg: '#f5f3ff' }
         ].map((stat, i) => (
           <div key={i} className="hover-lift" style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div>
                 <div style={{ color: 'var(--color-text-muted)', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.5rem' }}>{stat.label}</div>
                 <div style={{ fontSize: '1.875rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{stat.val}</div>
              </div>
              <div style={{ background: stat.bg, color: stat.color, padding: '0.5rem', borderRadius: '8px' }}>
                 <stat.icon size={20} />
              </div>
           </div>
         ))}
      </div>

      {/* Segmented Sub-Navigation */}
      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
         {[
           { id: 'bracket', label: 'Bracket View' },
           { id: 'schedule', label: 'Schedule' }
         ].map((tab) => (
           <button 
             key={tab.id}
             onClick={() => setActiveTab(tab.id)}
             style={{ 
               padding: '0.75rem 0', 
               fontWeight: activeTab === tab.id ? 700 : 500,
               color: activeTab === tab.id ? 'var(--color-primary-dark)' : '#64748b',
               borderBottom: activeTab === tab.id ? '3px solid var(--color-primary-dark)' : '3px solid transparent',
               transition: 'all 0.2s ease'
             }}
           >
             {tab.label}
           </button>
         ))}
      </div>

      {/* Dynamic Tab Content */}
      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
         
         {activeTab === 'bracket' && (
           <div style={{ padding: '2rem', minHeight: '400px' }}>
             <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
               <div style={{ flex: '0 0 420px', minWidth: '320px', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 20px 50px -30px rgba(15, 23, 42, 0.15)' }}>
                 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                   <div>
                     <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Tournaments</div>
                     <div style={{ fontSize: '0.875rem', color: '#64748b' }}>{tournaments.length} total</div>
                   </div>
                   <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.35rem 0.75rem', borderRadius: '999px', background: '#f8fafc', color: '#475569', fontSize: '0.75rem', fontWeight: 700 }}>{activeTournament.status}</div>
                 </div>
                 <div style={{ display: 'grid', gap: '1rem', maxHeight: 'calc(100vh - 260px)', overflowY: 'auto', paddingRight: '0.5rem', marginBottom: '0.75rem' }}>
                   {tournaments.map((t) => {
                      const isSelected = t.id === activeTournamentId;
                      return (
                         <button
                            key={t.id}
                            onClick={() => setActiveTournamentId(t.id)}
                            className="hover-lift"
                            style={{
                               textAlign: 'left',
                               padding: '1rem',
                               borderRadius: '16px',
                               border: isSelected ? '2px solid var(--color-primary-dark)' : '1px solid #e2e8f0',
                               background: isSelected ? '#eff6ff' : 'white',
                               cursor: 'pointer',
                               transition: 'all 0.2s ease',
                               minHeight: '120px',
                               display: 'flex',
                               flexDirection: 'column',
                               justifyContent: 'space-between'
                            }}
                         >
                            <div>
                               <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.5rem' }}>{t.name}</div>
                               <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>{t.participants.length} participants</div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                               <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? 'var(--color-primary-dark)' : '#475569', textTransform: 'uppercase' }}>{t.status}</span>
                               <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t.format === 'bracket' ? 'Bracket' : t.format}</span>
                            </div>
                         </button>
                      );
                   })}
                 </div>
                 <div style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>Scroll vertically to see more tournaments. Selecting a card will refresh the bracket preview on the right.</div>
               </div>

               <div style={{ flex: '1 1 0', minWidth: '360px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                 <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 20px 50px -30px rgba(15, 23, 42, 0.15)' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                       <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{activeTournament.name}</h3>
                       <button onClick={handleEditClick} className="btnOutline scale-btn" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                         <Edit size={14} /> Edit Settings
                       </button>
                     </div>
                     <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: activeTournament.status === 'Live' ? '#fef2f2' : '#f8fafc', color: activeTournament.status === 'Live' ? 'var(--color-danger)' : '#64748b', border: activeTournament.status === 'Live' ? '1px solid #fca5a5' : '1px solid #cbd5e1', padding: '0.35rem 0.9rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 700 }}>
                       <div style={{ width: 6, height: 6, borderRadius: '50%', background: activeTournament.status === 'Live' ? 'var(--color-danger)' : '#64748b' }} className={activeTournament.status === 'Live' ? 'animate-pulse' : ''}></div> {activeTournament.status}
                     </div>
                   </div>
                 </div>

                 {isExternalTournament ? (
                   <div style={{ flex: 1, minHeight: '420px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569' }}>External Website Preview</div>
                     <div style={{ position: 'relative', borderRadius: '16px', overflow: 'hidden', border: '1px solid #cbd5e1', minHeight: '320px', background: 'white' }}>
                       {activeTournament.externalUrl ? (
                         <>
                           <iframe
                             src={activeTournament.externalUrl}
                             title={activeTournament.name}
                             style={{ width: '100%', height: '100%', border: '0' }}
                             loading="lazy"
                           />
                           <div
                             onClick={() => activeTournament.externalUrl && window.open(activeTournament.externalUrl, '_blank')}
                             style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.45)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}
                           >
                             Click preview to open website
                           </div>
                         </>
                       ) : (
                         <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.95rem' }}>No external link attached.</div>
                       )}
                     </div>
                     <button
                       onClick={() => activeTournament.externalUrl && window.open(activeTournament.externalUrl, '_blank')}
                       className="btnSolid scale-btn"
                       style={{ padding: '0.9rem 1rem', background: 'var(--color-primary-dark)', color: 'white', alignSelf: 'flex-start' }}
                     >
                       Open Website
                     </button>
                   </div>
                 ) : (
                   <div style={{ flex: 1, minHeight: '420px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', overflowX: 'auto' }}>
                     <div style={{ display: 'flex', gap: '4rem', alignItems: 'center', minWidth: 'max-content' }}>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                         <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Quarter Finals</div>
                         <div className="hover-lift" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', width: '220px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                           <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontWeight: activeTournament.matches.q1.s1 > activeTournament.matches.q1.s2 ? 700 : 500, color: activeTournament.matches.q1.s1 > activeTournament.matches.q1.s2 ? 'var(--color-text-main)' : '#64748b', background: activeTournament.matches.q1.s1 > activeTournament.matches.q1.s2 ? 'white' : '#f8fafc' }}><span>{activeTournament.matches.q1.t1}</span><span style={{ color: activeTournament.matches.q1.s1 > activeTournament.matches.q1.s2 ? 'var(--color-primary-dark)' : '#64748b' }}>{activeTournament.matches.q1.s1}</span></div>
                           <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', fontWeight: activeTournament.matches.q1.s2 > activeTournament.matches.q1.s1 ? 700 : 500, color: activeTournament.matches.q1.s2 > activeTournament.matches.q1.s1 ? 'var(--color-text-main)' : '#64748b', background: activeTournament.matches.q1.s2 > activeTournament.matches.q1.s1 ? 'white' : '#f8fafc' }}><span>{activeTournament.matches.q1.t2}</span><span style={{ color: activeTournament.matches.q1.s2 > activeTournament.matches.q1.s1 ? 'var(--color-primary-dark)' : '#64748b' }}>{activeTournament.matches.q1.s2}</span></div>
                         </div>
                         <div className="hover-lift" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', width: '220px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                           <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontWeight: activeTournament.matches.q2.s1 > activeTournament.matches.q2.s2 ? 700 : 500, color: activeTournament.matches.q2.s1 > activeTournament.matches.q2.s2 ? 'var(--color-text-main)' : '#64748b', background: activeTournament.matches.q2.s1 > activeTournament.matches.q2.s2 ? 'white' : '#f8fafc' }}><span>{activeTournament.matches.q2.t1}</span><span style={{ color: activeTournament.matches.q2.s1 > activeTournament.matches.q2.s2 ? 'var(--color-primary-dark)' : '#64748b' }}>{activeTournament.matches.q2.s1}</span></div>
                           <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', fontWeight: activeTournament.matches.q2.s2 > activeTournament.matches.q2.s1 ? 700 : 500, color: activeTournament.matches.q2.s2 > activeTournament.matches.q2.s1 ? 'var(--color-text-main)' : '#64748b', background: activeTournament.matches.q2.s2 > activeTournament.matches.q2.s1 ? 'white' : '#f8fafc' }}><span>{activeTournament.matches.q2.t2}</span><span style={{ color: activeTournament.matches.q2.s2 > activeTournament.matches.q2.s1 ? 'var(--color-primary-dark)' : '#64748b' }}>{activeTournament.matches.q2.s2}</span></div>
                         </div>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', position: 'relative' }}>
                         <div style={{ position: 'absolute', left: '-2rem', top: '25%', width: '2rem', height: '1px', background: '#cbd5e1' }}></div>
                         <div style={{ position: 'absolute', left: '-2rem', bottom: '25%', width: '2rem', height: '1px', background: '#cbd5e1' }}></div>
                         <div style={{ position: 'absolute', left: '-2rem', top: '25%', width: '1px', height: '50.5%', background: '#cbd5e1' }}></div>
                         <div style={{ position: 'absolute', left: '-2rem', top: '50%', width: '2rem', height: '1px', background: '#cbd5e1' }}></div>
                         <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Semi Finals</div>
                         <div className="hover-lift" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', width: '220px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                           <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontWeight: activeTournament.matches.s1.s1 > activeTournament.matches.s1.s2 ? 700 : 500, color: activeTournament.matches.s1.s1 > activeTournament.matches.s1.s2 ? 'var(--color-text-main)' : '#64748b', background: activeTournament.matches.s1.s1 > activeTournament.matches.s1.s2 ? 'white' : '#f8fafc' }}><span>{activeTournament.matches.s1.t1}</span><span style={{ color: activeTournament.matches.s1.s1 > activeTournament.matches.s1.s2 ? 'var(--color-primary-dark)' : '#64748b' }}>{activeTournament.matches.s1.s1}</span></div>
                           <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', fontWeight: activeTournament.matches.s1.s2 > activeTournament.matches.s1.s1 ? 700 : 500, color: activeTournament.matches.s1.s2 > activeTournament.matches.s1.s1 ? 'var(--color-text-main)' : '#64748b', background: activeTournament.matches.s1.s2 > activeTournament.matches.s1.s1 ? 'white' : '#f8fafc' }}><span>{activeTournament.matches.s1.t2}</span><span style={{ color: activeTournament.matches.s1.s2 > activeTournament.matches.s1.s1 ? 'var(--color-primary-dark)' : '#64748b' }}>{activeTournament.matches.s1.s2}</span></div>
                         </div>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', position: 'relative' }}>
                         <div style={{ position: 'absolute', left: '-2rem', top: '50%', width: '2rem', height: '1px', background: '#cbd5e1' }}></div>
                         <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Trophy size={14} /> Grand Final</div>
                         <div className="hover-lift" style={{ background: 'white', border: '2px solid #f59e0b', borderRadius: '8px', width: '220px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(245,158,11,0.2)' }}>
                           <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #fcf3c0', fontWeight: 800, color: 'var(--color-text-main)', background: '#fffbeb' }}><span>{activeTournament.matches.f1.t1}</span><span style={{ color: 'var(--color-primary-dark)' }}>{activeTournament.matches.f1.s1}</span></div>
                           <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 500, color: '#64748b', background: 'white' }}><span>{activeTournament.matches.f1.t2}</span><span>{activeTournament.matches.f1.s2}</span></div>
                         </div>
                       </div>
                     </div>
                   </div>
                 )}
               </div>
             </div>
           </div>
         )}

         {activeTab === 'schedule' && (
           <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Upcoming Schedule</h3>
              {[
                { date: 'Oct 24, 2026', time: '10:00 AM', match: 'Lions vs Tigers', tournament: 'Esports Spring Cup' },
                { date: 'Oct 24, 2026', time: '01:00 PM', match: 'Bears vs Wolves', tournament: 'Esports Spring Cup' },
                { date: 'Oct 25, 2026', time: '09:00 AM', match: 'Semi-Final 1', tournament: 'Tech Summit Championship' },
                { date: 'Oct 26, 2026', time: '03:00 PM', match: 'Grand Final', tournament: 'Tech Summit Championship' }
              ].map((item, i) => (
                <div key={i} className="hover-lift" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '1rem' }}>
                   <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexWrap: 'wrap' }}>
                      <div style={{ textAlign: 'center', background: 'white', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', minWidth: '110px' }}>
                         <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase' }}>{item.date}</div>
                         <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-primary-dark)' }}>{item.time}</div>
                      </div>
                      <div>
                         <div style={{ fontSize: '1.125rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '0.25rem' }}>{item.match}</div>
                         <div style={{ fontSize: '0.875rem', color: '#64748b', fontWeight: 500 }}>{item.tournament}</div>
                      </div>
                   </div>
                   <button className="btnOutline scale-btn" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>Edit Time</button>
                </div>
              ))}
           </div>
         )}
      </div>

      {/* Edit Tournament Settings Modal */}
      {isEditModalOpen && editForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="animate-fade-in" style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Edit Tournament Settings</h2>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', transition: 'all 0.2s' }}
                className="hover-lift"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleEditSave} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Tournament Name</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  required
                  style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                  style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.95rem' }}
                >
                  <option value="Live">Live</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="In-Active">In-Active</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Manage Participants</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '42px', background: '#f8fafc' }}>
                  {editForm.participants.map((p, i) => (
                    <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'white', border: '1px solid #cbd5e1', padding: '0.25rem 0.625rem', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                      {p}
                      <button 
                        type="button" 
                        onClick={() => setEditForm({...editForm, participants: editForm.participants.filter((_, index) => index !== i)})}
                        style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  {editForm.participants.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.875rem', padding: '0.25rem' }}>No participants added yet.</span>}
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <input 
                    type="text" 
                    id="newParticipantInput"
                    placeholder="Type name & press Enter to add"
                    style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const val = e.target.value.trim();
                        if (val && !editForm.participants.includes(val)) {
                          setEditForm({...editForm, participants: [...editForm.participants, val]});
                        }
                        if (val) e.target.value = '';
                      }
                    }}
                  />
                  <button 
                    type="button" 
                    onClick={() => {
                      const input = document.getElementById('newParticipantInput');
                      const val = input.value.trim();
                      if (val && !editForm.participants.includes(val)) {
                        setEditForm({...editForm, participants: [...editForm.participants, val]});
                      }
                      input.value = '';
                    }}
                    className="btnSolid scale-btn" 
                    style={{ padding: '0 1.5rem', background: 'var(--color-primary-main)' }}
                  >
                    Add
                  </button>
                </div>
              </div>

              <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                 <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-text-main)' }}>Bracket Sequences</h4>
                 
                 <div style={{ display: 'grid', gap: '1rem' }}>
                    {/* Q1 Match */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                       <div style={{ fontSize: '0.75rem', fontWeight: 700, width: '40px' }}>Q1:</div>
                       <select value={editForm.matches.q1.t1} onChange={(e) => setEditForm({...editForm, matches: {...editForm.matches, q1: {...editForm.matches.q1, t1: e.target.value}}})} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option value="TBD">TBD</option>
                          {editForm.participants.map((p, i) => <option key={i} value={p}>{p}</option>)}
                       </select>
                       <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>VS</span>
                       <select value={editForm.matches.q1.t2} onChange={(e) => setEditForm({...editForm, matches: {...editForm.matches, q1: {...editForm.matches.q1, t2: e.target.value}}})} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option value="TBD">TBD</option>
                          {editForm.participants.map((p, i) => <option key={i} value={p}>{p}</option>)}
                       </select>
                    </div>

                    {/* Q2 Match */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                       <div style={{ fontSize: '0.75rem', fontWeight: 700, width: '40px' }}>Q2:</div>
                       <select value={editForm.matches.q2.t1} onChange={(e) => setEditForm({...editForm, matches: {...editForm.matches, q2: {...editForm.matches.q2, t1: e.target.value}}})} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option value="TBD">TBD</option>
                          {editForm.participants.map((p, i) => <option key={i} value={p}>{p}</option>)}
                       </select>
                       <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>VS</span>
                       <select value={editForm.matches.q2.t2} onChange={(e) => setEditForm({...editForm, matches: {...editForm.matches, q2: {...editForm.matches.q2, t2: e.target.value}}})} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option value="TBD">TBD</option>
                          {editForm.participants.map((p, i) => <option key={i} value={p}>{p}</option>)}
                       </select>
                    </div>

                    {/* S1 Match */}
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                       <div style={{ fontSize: '0.75rem', fontWeight: 700, width: '40px' }}>S1:</div>
                       <select value={editForm.matches.s1.t1} onChange={(e) => setEditForm({...editForm, matches: {...editForm.matches, s1: {...editForm.matches.s1, t1: e.target.value}}})} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option value="TBD">TBD</option>
                          {editForm.participants.map((p, i) => <option key={i} value={p}>{p}</option>)}
                          <option value="Winner Q1">Winner Q1</option>
                       </select>
                       <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>VS</span>
                       <select value={editForm.matches.s1.t2} onChange={(e) => setEditForm({...editForm, matches: {...editForm.matches, s1: {...editForm.matches.s1, t2: e.target.value}}})} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option value="TBD">TBD</option>
                          {editForm.participants.map((p, i) => <option key={i} value={p}>{p}</option>)}
                          <option value="Winner Q2">Winner Q2</option>
                       </select>
                    </div>
                    
                     {/* F1 Match */}
                     <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                       <div style={{ fontSize: '0.75rem', fontWeight: 700, width: '40px' }}>Final:</div>
                       <select value={editForm.matches.f1.t1} onChange={(e) => setEditForm({...editForm, matches: {...editForm.matches, f1: {...editForm.matches.f1, t1: e.target.value}}})} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option value="TBD">TBD</option>
                          {editForm.participants.map((p, i) => <option key={i} value={p}>{p}</option>)}
                          <option value="Winner S1">Winner S1</option>
                       </select>
                       <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>VS</span>
                       <select value={editForm.matches.f1.t2} onChange={(e) => setEditForm({...editForm, matches: {...editForm.matches, f1: {...editForm.matches.f1, t2: e.target.value}}})} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                          <option value="TBD">TBD</option>
                          {editForm.participants.map((p, i) => <option key={i} value={p}>{p}</option>)}
                       </select>
                    </div>
                 </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  className="btnOutline scale-btn" 
                  style={{ flex: 1, padding: '0.875rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btnSolid scale-btn" 
                  style={{ flex: 1, padding: '0.875rem', background: 'var(--color-primary-dark)', color: 'white' }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Tournament Modal */}
      {isModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="animate-fade-in" style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>New Tournament</h2>
              <button 
                onClick={() => setIsModalOpen(false)}
                style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '8px', transition: 'all 0.2s' }}
                className="hover-lift"
              >
                <X size={20} />
              </button>
            </div>
            
            <form 
              onSubmit={(e) => { 
                e.preventDefault(); 
                const newId = tournaments.length > 0 ? Math.max(...tournaments.map(t => t.id)) + 1 : 1;
                const newTournament = {
                  id: newId,
                  name: tournamentForm.name,
                  status: 'Upcoming',
                  format: tournamentForm.format,
                  previewType: tournamentForm.previewType,
                  externalUrl: tournamentForm.previewType === 'external' ? tournamentForm.externalUrl : '',
                  participants: tournamentForm.previewType === 'external' ? [] : Array.from({ length: Number(tournamentForm.participants) }, (_, i) => `Team ${i + 1}`),
                  matches: tournamentForm.previewType === 'external' ? {} : {
                    q1: { t1: 'TBD', s1: '-', t2: 'TBD', s2: '-' },
                    q2: { t1: 'TBD', s1: '-', t2: 'TBD', s2: '-' },
                    s1: { t1: 'TBD', s1: '-', t2: 'TBD', s2: '-' },
                    f1: { t1: 'TBD', s1: '-', t2: 'TBD', s2: '-' }
                  }
                };
                setTournaments([...tournaments, newTournament]);
                setActiveTournamentId(newId);
                setIsModalOpen(false); 
                alert(`Tournament "${tournamentForm.name}" created successfully!`); 
                setTournamentForm({name: '', participants: '', format: 'bracket', previewType: 'bracket', externalUrl: ''});
              }} 
              style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}
            >
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Tournament Name</label>
                <input 
                  type="text" 
                  value={tournamentForm.name}
                  onChange={(e) => setTournamentForm({...tournamentForm, name: e.target.value})}
                  required
                  placeholder="e.g. Summer Esports Cup"
                  style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Number of Participants</label>
                <input 
                  type="number" 
                  min="2"
                  value={tournamentForm.participants}
                  onChange={(e) => setTournamentForm({...tournamentForm, participants: e.target.value})}
                  required
                  placeholder="e.g. 16"
                  style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Tournament Format</label>
                <select
                  value={tournamentForm.format}
                  onChange={(e) => setTournamentForm({...tournamentForm, format: e.target.value})}
                  style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.95rem', cursor: 'pointer', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                >
                  <option value="bracket">Bracket (Elimination)</option>
                  <option value="sequential">Sequential (Round Robin)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Preview Source</label>
                <select
                  value={tournamentForm.previewType}
                  onChange={(e) => setTournamentForm({...tournamentForm, previewType: e.target.value})}
                  style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.95rem', cursor: 'pointer', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                >
                  <option value="bracket">Bracket Preview</option>
                  <option value="external">External Website</option>
                </select>
              </div>
              {tournamentForm.previewType === 'external' && (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>External Website URL</label>
                  <input
                    type="url"
                    value={tournamentForm.externalUrl}
                    onChange={(e) => setTournamentForm({...tournamentForm, externalUrl: e.target.value})}
                    required
                    placeholder="https://example.com"
                    style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="btnOutline scale-btn" 
                  style={{ flex: 1, padding: '0.875rem' }}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btnSolid scale-btn" 
                  style={{ flex: 1, padding: '0.875rem', background: 'var(--color-primary-dark)', color: 'white' }}
                >
                  Create Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
