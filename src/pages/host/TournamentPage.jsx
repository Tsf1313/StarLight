import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Plus, Edit, X, ChevronDown, List } from 'lucide-react';
import { api } from '../../services/api'; 

export default function TournamentPage() {
  // Hardcoded for now to bypass the missing EventContext file
  const selectedEventId = 'e_001'; 
  
  const [activeTab, setActiveTab] = useState('bracket');
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [tournaments, setTournaments] = useState([]);
  const [activeTournamentId, setActiveTournamentId] = useState(null);
  
  const activeTournament = tournaments.find(t => t.id === activeTournamentId) || tournaments[0];
  const isExternalTournament = activeTournament?.preview_type === 'external';

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [scheduleItems, setScheduleItems] = useState([]);
  const [scheduleForm, setScheduleForm] = useState({ title: '', location: '', session_time: '', status: 'upcoming' });
  const [editingScheduleId, setEditingScheduleId] = useState(null);

  const [tournamentForm, setTournamentForm] = useState({
    name: '',
    participants: '',
    format: 'bracket',
    previewType: 'bracket',
    externalUrl: ''
  });

  // --- HELPER: GENERATE DYNAMIC BRACKET ---
  const generateInitialBracket = (participantCount, names = []) => {
    const count = parseInt(participantCount) || 2;
    const numRounds = Math.ceil(Math.log2(count));
    const rounds = [];
    
    const participants = names.length > 0 ? names : Array.from({ length: count }, (_, i) => `Team ${i + 1}`);

    for (let r = 0; r < numRounds; r++) {
      const matchesInRound = Math.pow(2, numRounds - r - 1);
      const matches = [];
      for (let m = 0; m < matchesInRound; m++) {
        let t1 = 'TBD', t2 = 'TBD';
        if (r === 0) {
          t1 = participants[m * 2] || 'BYE';
          t2 = participants[m * 2 + 1] || 'BYE';
        }
        matches.push({ id: `r${r}m${m}`, t1, s1: 0, t2, s2: 0, winner: null });
      }
      rounds.push({ name: r === numRounds - 1 ? 'Final' : `Round ${r + 1}`, matches });
    }
    return { rounds, participants };
  };

  // --- LOGIC: EDIT NAMES & ADVANCE WINNER ---
  const handleNameChange = (roundIdx, matchIdx, teamKey, newName) => {
    const updatedRounds = [...editForm.bracket_data.rounds];
    updatedRounds[roundIdx].matches[matchIdx][teamKey] = newName;
    setEditForm({
      ...editForm,
      bracket_data: { ...editForm.bracket_data, rounds: updatedRounds }
    });
  };

  const handleAdvanceTeam = (roundIdx, matchIdx, winnerName) => {
    const updatedRounds = [...editForm.bracket_data.rounds];
    const match = updatedRounds[roundIdx].matches[matchIdx];
    
    // Mark the current match winner for UI highlighting
    match.winner = winnerName;

    // Advance the winner to the next round if there is one
    if (roundIdx + 1 < updatedRounds.length) {
      const nextMatchIdx = Math.floor(matchIdx / 2);
      const nextTeamKey = matchIdx % 2 === 0 ? 't1' : 't2';
      updatedRounds[roundIdx + 1].matches[nextMatchIdx][nextTeamKey] = winnerName;
    }

    setEditForm({
      ...editForm,
      bracket_data: { ...editForm.bracket_data, rounds: updatedRounds }
    });
  };

  const handleSequentialChange = (index, field, value) => {
    const updatedParticipants = [...editForm.bracket_data.participants];
    updatedParticipants[index] = { 
      ...updatedParticipants[index], 
      [field]: field === 'score' ? (parseInt(value) || 0) : value 
    };
    setEditForm({
      ...editForm,
      bracket_data: { ...editForm.bracket_data, participants: updatedParticipants }
    });
  };

  // --- API FETCHERS ---
  const fetchTournaments = async () => {
    if (!selectedEventId) {
      setTournaments([]);
      setActiveTournamentId(null);
      return;
    }
    try {
      const data = await api.getTournaments(selectedEventId);
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
      if (normalizedData.length > 0 && !activeTournamentId) {
        setActiveTournamentId(normalizedData[0].id);
      }
    } catch (err) { console.error("Failed to load tournaments:", err); }
  };

  const fetchSchedules = async () => {
    if (!selectedEventId) { setScheduleItems([]); return; }
    try {
      const data = await api.getSchedules(selectedEventId);
      setScheduleItems(data);
    } catch (err) { setScheduleItems([]); }
  };

  useEffect(() => {
    fetchTournaments();
    fetchSchedules();
  }, [selectedEventId]);

  const handleEditClick = () => {
    setEditForm(JSON.parse(JSON.stringify(activeTournament)));
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      await api.updateTournament(editForm.id, editForm, selectedEventId);
      setTournaments(tournaments.map(t => t.id === editForm.id ? editForm : t));
      setIsEditModalOpen(false);
      alert('Updated successfully!');
    } catch (err) { alert(err.message); }
  };

  const handleCreateTournament = async (e) => {
    e.preventDefault(); 
    if (!selectedEventId) return alert('Select an event first.');
    
    let bracket_data = {};
    if (tournamentForm.previewType !== 'external') {
        if (tournamentForm.format === 'bracket') {
            bracket_data = generateInitialBracket(tournamentForm.participants);
        } else {
            bracket_data = {
                participants: Array.from({ length: Number(tournamentForm.participants) }, (_, i) => ({ name: `Team ${i + 1}`, score: 0 }))
            };
        }
    }

    const newTournamentData = {
      id: `t_${Date.now()}`,
      event_id: selectedEventId,
      name: tournamentForm.name,
      status: 'Upcoming',
      format: tournamentForm.format,
      preview_type: tournamentForm.previewType,
      external_url: tournamentForm.previewType === 'external' ? tournamentForm.externalUrl : '',
      bracket_data
    };

    try {
      await api.createTournament(newTournamentData, selectedEventId);
      await fetchTournaments();
      setActiveTournamentId(newTournamentData.id);
      setIsModalOpen(false); 
      setTournamentForm({name: '', participants: '', format: 'bracket', previewType: 'bracket', externalUrl: ''});
    } catch (err) { alert(err.message); }
  };

  const handleDeleteTournament = async (id) => {
    if (!window.confirm('Delete this tournament?')) return;
    try {
      await api.deleteTournament(id, selectedEventId);
      await fetchTournaments();
    } catch (err) { alert(err.message); }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...scheduleForm, id: editingScheduleId || `sc_${Date.now()}` };
      editingScheduleId ? await api.updateSchedule(editingScheduleId, payload, selectedEventId) : await api.createSchedule(payload, selectedEventId);
      await fetchSchedules();
      setEditingScheduleId(null);
      setScheduleForm({ title: '', location: '', session_time: '', status: 'upcoming' });
    } catch (err) { alert(err.message); }
  };

  const handleEditSchedule = (item) => {
    setEditingScheduleId(item.id);
    setScheduleForm({ ...item, session_time: item.session_time?.slice(0,16) || '' });
  };

  const handleDeleteSchedule = async (id) => {
    if (!window.confirm('Delete this schedule item?')) return;
    try {
      await api.deleteSchedule(id, selectedEventId);
      await fetchSchedules();
      if (editingScheduleId === id) {
        setEditingScheduleId(null);
        setScheduleForm({ title: '', location: '', session_time: '', status: 'upcoming' });
      }
    } catch (err) { alert('Failed to delete schedule: ' + err.message); }
  };

  if (tournaments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <Trophy size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
        <button onClick={() => setIsModalOpen(true)} className="btnSolid scale-btn" style={{ padding: '0.75rem 1.5rem', background: 'var(--color-primary-dark)', color: 'white' }}>Create First Tournament</button>
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="animate-fade-in" style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>New Tournament</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '8px', transition: 'all 0.2s' }} className="hover-lift"><X size={20} /></button>
              </div>
              
              <form onSubmit={handleCreateTournament} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Tournament Name</label>
                  <input type="text" value={tournamentForm.name} onChange={(e) => setTournamentForm({...tournamentForm, name: e.target.value})} required placeholder="e.g. Summer Esports Cup" style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s', boxSizing: 'border-box' }} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Tournament Format</label>
                  <select value={tournamentForm.format} onChange={(e) => setTournamentForm({...tournamentForm, format: e.target.value})} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.95rem', cursor: 'pointer', transition: 'border-color 0.2s', boxSizing: 'border-box' }}>
                    <option value="bracket">Bracket (Elimination)</option>
                    <option value="sequential">Sequential (Round Robin)</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Preview Source</label>
                  <select value={tournamentForm.previewType} onChange={(e) => setTournamentForm({...tournamentForm, previewType: e.target.value})} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.95rem', cursor: 'pointer', transition: 'border-color 0.2s', boxSizing: 'border-box' }}>
                    <option value="bracket">Internal Bracket Preview</option>
                    <option value="external">External Website Link</option>
                  </select>
                </div>

                {tournamentForm.previewType === 'external' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>External Website URL</label>
                    <input type="url" value={tournamentForm.externalUrl} onChange={(e) => setTournamentForm({...tournamentForm, externalUrl: e.target.value})} required placeholder="https://challonge.com/my-tourney" style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s', boxSizing: 'border-box' }} />
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Number of Participants</label>
                    <input type="number" min="2" value={tournamentForm.participants} onChange={(e) => setTournamentForm({...tournamentForm, participants: e.target.value})} required placeholder="e.g. 16" style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s', boxSizing: 'border-box' }} />
                  </div>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btnOutline scale-btn" style={{ flex: 1, padding: '0.875rem' }}>Cancel</button>
                  <button type="submit" className="btnSolid scale-btn" style={{ flex: 1, padding: '0.875rem', background: 'var(--color-primary-dark)', color: 'white' }}>Create Tournament</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div>
           <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>Tournament Management</h1>
           <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage brackets, scores, and standings.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="btnSolid scale-btn" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Plus size={16} /> New Tournament</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
         {[
           { label: 'Active Tournaments', val: tournaments.filter(t => t.status === 'Live').length, icon: Trophy, color: '#f59e0b', bg: '#fffbeb' },
           { label: 'Upcoming Matches', val: scheduleItems.length, icon: Clock, color: '#8b5cf6', bg: '#f5f3ff' }
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

      <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
         {['bracket', 'schedule'].map((tab) => (
           <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '0.75rem 0', fontWeight: activeTab === tab ? 700 : 500, color: activeTab === tab ? 'var(--color-primary-dark)' : '#64748b', borderBottom: activeTab === tab ? '3px solid var(--color-primary-dark)' : '3px solid transparent' }}>
             {tab === 'bracket' ? 'Tournament View' : 'Schedule'}
           </button>
         ))}
      </div>

      <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
         {activeTab === 'bracket' && (
           <div style={{ padding: '2rem', display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
             {/* Left Sidebar List */}
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
                      const pCount = t.bracket_data?.participants?.length || 0;
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
                               <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem' }}>
                                  {t.preview_type === 'external' ? 'External Bracket' : `${pCount} participants`}
                               </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                               <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isSelected ? 'var(--color-primary-dark)' : '#475569', textTransform: 'uppercase' }}>{t.status}</span>
                               <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{t.format === 'bracket' ? 'Bracket' : 'Sequential'}</span>
                            </div>
                         </button>
                      );
                   })}
                 </div>
                 <div style={{ color: '#64748b', fontSize: '0.85rem', lineHeight: 1.6 }}>Scroll vertically to see more tournaments. Selecting a card will refresh the bracket preview on the right.</div>
               </div>

             {/* Right Content Area */}
             <div style={{ flex: '1 1 0', minWidth: '360px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
               <div style={{ background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', boxShadow: '0 20px 50px -30px rgba(15, 23, 42, 0.15)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 800, margin: 0 }}>{activeTournament.name}</h3>
                      <button onClick={handleEditClick} className="btnOutline scale-btn" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                         <Edit size={14} /> Edit Settings
                      </button>
                      <button onClick={() => handleDeleteTournament(activeTournament.id)} className="btnOutline scale-btn" style={{ padding: '0.5rem 0.9rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.45rem', color: '#b91c1c', borderColor: '#fecaca' }}>
                         <X size={14} /> Delete
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
                     {activeTournament.external_url ? (
                       <>
                         <iframe src={activeTournament.external_url} title={activeTournament.name} style={{ width: '100%', height: '100%', border: '0' }} loading="lazy" />
                         <div onClick={() => activeTournament.external_url && window.open(activeTournament.external_url, '_blank')} style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.45)', color: '#0f172a', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                           Click preview to open website
                         </div>
                       </>
                     ) : (
                       <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#64748b', fontSize: '0.95rem' }}>No external link attached.</div>
                     )}
                   </div>
                   <button onClick={() => activeTournament.external_url && window.open(activeTournament.external_url, '_blank')} className="btnSolid scale-btn" style={{ padding: '0.9rem 1rem', background: 'var(--color-primary-dark)', color: 'white', alignSelf: 'flex-start' }}>Open Website</button>
                 </div>
               ) : activeTournament.format === 'bracket' ? (
                 <div style={{ flex: 1, minHeight: '420px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem', overflowX: 'auto' }}>
                   <div style={{ display: 'flex', gap: '3rem', minWidth: 'max-content' }}>
                     {activeTournament.bracket_data?.rounds?.map((round, rIdx) => (
                       <div key={rIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: '200px', justifyContent: 'center' }}>
                         <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{round.name}</div>
                         {round.matches.map((m, mIdx) => {
                           const isT1Winner = m.winner && m.winner === m.t1 && m.t1 !== 'TBD' && m.t1 !== 'BYE';
                           const isT2Winner = m.winner && m.winner === m.t2 && m.t2 !== 'TBD' && m.t2 !== 'BYE';
                           
                           return (
                           <div key={mIdx} className="hover-lift" style={{ background: 'white', border: rIdx === activeTournament.bracket_data.rounds.length - 1 ? '2px solid #f59e0b' : '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                             <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', fontWeight: isT1Winner ? 800 : 500, color: isT1Winner ? 'var(--color-text-main)' : '#64748b', background: isT1Winner ? '#eff6ff' : '#f8fafc', borderLeft: isT1Winner ? '4px solid var(--color-primary-main)' : '4px solid transparent', transition: 'all 0.2s' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{m.t1} {isT1Winner && <Trophy size={14} style={{ color: 'var(--color-primary-main)' }} />}</div>
                             </div>
                             <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: isT2Winner ? 800 : 500, color: isT2Winner ? 'var(--color-text-main)' : '#64748b', background: isT2Winner ? '#eff6ff' : '#f8fafc', borderLeft: isT2Winner ? '4px solid var(--color-primary-main)' : '4px solid transparent', transition: 'all 0.2s' }}>
                               <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>{m.t2} {isT2Winner && <Trophy size={14} style={{ color: 'var(--color-primary-main)' }} />}</div>
                             </div>
                           </div>
                         )})}
                       </div>
                     ))}
                   </div>
                 </div>
               ) : (
                 <div style={{ flex: 1, minHeight: '420px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '1.5rem' }}>
                   <div style={{ fontSize: '0.875rem', fontWeight: 700, color: '#475569', marginBottom: '1rem' }}>Sequential Standings</div>
                   {activeTournament.bracket_data?.participants?.map((p, i) => (
                     <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', background: 'white', marginBottom: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                       <span style={{ fontWeight: 700 }}>{p.name || p}</span>
                       <span style={{ fontWeight: 900, color: 'var(--color-primary-dark)' }}>{p.score || 0} pts</span>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </div>
         )}
         
         {activeTab === 'schedule' && (
           <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Tournament Schedule</h3>

              <form onSubmit={handleSaveSchedule} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr', gap: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
                <input value={scheduleForm.title} onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })} placeholder="Match / Session title" required style={{ padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
                <input value={scheduleForm.location} onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })} placeholder="Location" style={{ padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
                <input type="datetime-local" value={scheduleForm.session_time} onChange={(e) => setScheduleForm({ ...scheduleForm, session_time: e.target.value })} required style={{ padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }} />
                <select value={scheduleForm.status} onChange={(e) => setScheduleForm({ ...scheduleForm, status: e.target.value })} style={{ padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white', outline: 'none' }}>
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btnSolid scale-btn" style={{ background: 'var(--color-primary-dark)', padding: '0.55rem 1rem' }}>{editingScheduleId ? 'Update Item' : 'Add Item'}</button>
                  {editingScheduleId && <button type="button" className="btnOutline scale-btn" style={{ padding: '0.55rem 1rem' }} onClick={() => { setEditingScheduleId(null); setScheduleForm({ title: '', location: '', session_time: '', status: 'upcoming' }); }}>Cancel Edit</button>}
                </div>
              </form>

              {scheduleItems.length === 0 ? (
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem', color: '#64748b' }}>No schedule items for this event.</div>
              ) : (
                scheduleItems.map((item) => (
                  <div key={item.id} className="hover-lift" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem', borderRadius: '12px', border: '1px solid #e2e8f0', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{item.title}</div>
                      <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 500 }}>{item.location || '-'} | {item.session_time ? new Date(item.session_time).toLocaleString() : '-'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btnOutline scale-btn" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem' }} onClick={() => handleEditSchedule(item)}>Edit</button>
                      <button className="btnOutline scale-btn" style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', color: '#b91c1c', borderColor: '#fecaca' }} onClick={() => handleDeleteSchedule(item.id)}>Delete</button>
                    </div>
                  </div>
                ))
              )}
           </div>
         )}
      </div>

      {/* EDIT MODAL WITH DYNAMIC LOGIC */}
      {isEditModalOpen && editForm && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div className="animate-fade-in" style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Edit Tournament Settings</h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px', transition: 'all 0.2s' }} className="hover-lift"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleEditSave} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Tournament Name</label>
                <input type="text" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} required style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Status</label>
                <select value={editForm.status} onChange={(e) => setEditForm({...editForm, status: e.target.value})} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.95rem' }}>
                  <option value="Live">Live</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              {editForm.preview_type === 'external' ? (
                 <div>
                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>External Link</label>
                   <input type="url" value={editForm.external_url || ''} onChange={(e) => setEditForm({...editForm, external_url: e.target.value})} required style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} />
                 </div>
              ) : (
                <>
                  <div style={{ background: '#f8fafc', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-text-main)' }}>Bracket Management</h4>
                    
                    {editForm.format === 'bracket' && editForm.bracket_data?.rounds ? (
                      editForm.bracket_data.rounds.map((round, rIdx) => {
                        const isFinalRound = rIdx === editForm.bracket_data.rounds.length - 1;

                        return (
                          <div key={rIdx} style={{ marginBottom: '1.5rem' }}>
                            <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase', marginBottom: '0.5rem' }}>{round.name}</div>
                            {round.matches.map((m, mIdx) => (
                              <div key={mIdx} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem', background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                                
                                {/* Team 1 Row */}
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <input 
                                    type="text" 
                                    value={m.t1} 
                                    onChange={e => handleNameChange(rIdx, mIdx, 't1', e.target.value)} 
                                    placeholder="Team 1 Name"
                                    style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', fontWeight: 600 }} 
                                  />
                                  <button 
                                    type="button" 
                                    onClick={() => handleAdvanceTeam(rIdx, mIdx, m.t1)} 
                                    className="scale-btn" 
                                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: m.winner === m.t1 ? 'var(--color-primary-dark)' : '#f8fafc', color: m.winner === m.t1 ? 'white' : '#475569', fontWeight: 700, cursor: 'pointer' }}
                                  >
                                    {m.winner === m.t1 ? (isFinalRound ? 'Champion!' : 'Advanced') : (isFinalRound ? 'Set Winner' : 'Advance')}
                                  </button>
                                </div>

                                {/* Team 2 Row */}
                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <input 
                                    type="text" 
                                    value={m.t2} 
                                    onChange={e => handleNameChange(rIdx, mIdx, 't2', e.target.value)} 
                                    placeholder="Team 2 Name"
                                    style={{ flex: 1, padding: '0.4rem', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', fontWeight: 600 }} 
                                  />
                                  <button 
                                    type="button" 
                                    onClick={() => handleAdvanceTeam(rIdx, mIdx, m.t2)} 
                                    className="scale-btn" 
                                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.75rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: m.winner === m.t2 ? 'var(--color-primary-dark)' : '#f8fafc', color: m.winner === m.t2 ? 'white' : '#475569', fontWeight: 700, cursor: 'pointer' }}
                                  >
                                    {m.winner === m.t2 ? (isFinalRound ? 'Champion!' : 'Advanced') : (isFinalRound ? 'Set Winner' : 'Advance')}
                                  </button>
                                </div>

                              </div>
                            ))}
                          </div>
                        );
                      })
                    ) : editForm.format === 'sequential' && editForm.bracket_data?.participants ? (
                      editForm.bracket_data.participants.map((p, i) => (
                        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', background: 'white', padding: '0.75rem', borderRadius: '8px', border: '1px solid #cbd5e1', gap: '1rem' }}>
                          <input 
                            type="text" 
                            value={p.name || p} 
                            onChange={e => handleSequentialChange(i, 'name', e.target.value)} 
                            style={{ flex: 1, padding: '0.35rem', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none', fontWeight: 600 }} 
                          />
                          <input 
                            type="number" 
                            value={p.score || 0} 
                            onChange={e => handleSequentialChange(i, 'score', e.target.value)} 
                            style={{ width: '80px', padding: '0.35rem', textAlign: 'center', border: '1px solid #cbd5e1', borderRadius: '4px', outline: 'none' }} 
                          />
                        </div>
                      ))
                    ) : (
                       <div style={{ color: '#64748b' }}>No data available. If you changed formats, recreate the tournament.</div>
                    )}
                  </div>
                </>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setIsEditModalOpen(false)} className="btnOutline scale-btn" style={{ flex: 1, padding: '0.875rem' }}>Cancel</button>
                <button type="submit" className="btnSolid scale-btn" style={{ flex: 1, padding: '0.875rem', background: 'var(--color-primary-dark)', color: 'white' }}>Save Changes</button>
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
              <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0.5rem', borderRadius: '8px', transition: 'all 0.2s' }} className="hover-lift"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleCreateTournament} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Tournament Name</label>
                <input type="text" value={tournamentForm.name} onChange={(e) => setTournamentForm({...tournamentForm, name: e.target.value})} required placeholder="e.g. Summer Esports Cup" style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s', boxSizing: 'border-box' }} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Tournament Format</label>
                <select value={tournamentForm.format} onChange={(e) => setTournamentForm({...tournamentForm, format: e.target.value})} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.95rem', cursor: 'pointer', transition: 'border-color 0.2s', boxSizing: 'border-box' }}>
                  <option value="bracket">Bracket (Elimination)</option>
                  <option value="sequential">Sequential (Round Robin)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Preview Source</label>
                <select value={tournamentForm.previewType} onChange={(e) => setTournamentForm({...tournamentForm, previewType: e.target.value})} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.95rem', cursor: 'pointer', transition: 'border-color 0.2s', boxSizing: 'border-box' }}>
                  <option value="bracket">Internal Bracket Preview</option>
                  <option value="external">External Website Link</option>
                </select>
              </div>

              {tournamentForm.previewType === 'external' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>External Website URL</label>
                  <input type="url" value={tournamentForm.externalUrl} onChange={(e) => setTournamentForm({...tournamentForm, externalUrl: e.target.value})} required placeholder="https://challonge.com/my-tourney" style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s', boxSizing: 'border-box' }} />
                </div>
              ) : (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Number of Participants</label>
                  <input type="number" min="2" value={tournamentForm.participants} onChange={(e) => setTournamentForm({...tournamentForm, participants: e.target.value})} required placeholder="e.g. 16" style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s', boxSizing: 'border-box' }} />
                </div>
              )}

              <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" onClick={() => setIsModalOpen(false)} className="btnOutline scale-btn" style={{ flex: 1, padding: '0.875rem' }}>Cancel</button>
                <button type="submit" className="btnSolid scale-btn" style={{ flex: 1, padding: '0.875rem', background: 'var(--color-primary-dark)', color: 'white' }}>Create Tournament</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}