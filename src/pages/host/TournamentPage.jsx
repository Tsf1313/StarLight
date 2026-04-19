import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Plus, Edit, X, ChevronDown, List } from 'lucide-react';
import { api } from '../../services/api'; 
import { useEventContext } from '../../contexts/EventContext';

export default function TournamentPage() {
  const { selectedEventId } = useEventContext();
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

  const toLegacyRounds = (matches = {}) => {
    const safe = (m) => ({ t1: m?.t1 || 'TBD', s1: Number(m?.s1 || 0), t2: m?.t2 || 'TBD', s2: Number(m?.s2 || 0) });
    return [
      { name: 'Quarter Finals', matches: [{ id: 'r0m0', ...safe(matches.q1) }, { id: 'r0m1', ...safe(matches.q2) }] },
      { name: 'Semi Finals', matches: [{ id: 'r1m0', ...safe(matches.s1) }] },
      { name: 'Final', matches: [{ id: 'r2m0', ...safe(matches.f1) }] },
    ];
  };

  const normalizeTournament = (tournament) => {
    const next = { ...tournament };
    const bracketData = next?.bracket_data || {};

    if (next.format === 'bracket') {
      if (!Array.isArray(bracketData.rounds)) {
        next.bracket_data = {
          ...bracketData,
          rounds: toLegacyRounds(bracketData.matches || {}),
          participants: Array.isArray(bracketData.participants)
            ? bracketData.participants
            : String(bracketData.participants || '').split(' ').filter(Boolean),
        };
      }
    } else {
      const participants = Array.isArray(bracketData.participants) ? bracketData.participants : [];
      next.bracket_data = {
        ...bracketData,
        participants: participants.map((p, i) =>
          typeof p === 'string'
            ? { name: p || `Team ${i + 1}`, score: 0 }
            : { name: p?.name || `Team ${i + 1}`, score: Number(p?.score || 0) }
        ),
      };
    }

    return next;
  };

  // --- HELPER: GENERATE DYNAMIC BRACKET ---
  const generateInitialBracket = (participantCount, names = []) => {
    const count = parseInt(participantCount) || 2;
    const numRounds = Math.ceil(Math.log2(count));
    const rounds = [];
    
    // Create actual participant list
    const participants = names.length > 0 ? names : Array.from({ length: count }, (_, i) => `Team ${i + 1}`);

    for (let r = 0; r < numRounds; r++) {
      const matchesInRound = Math.pow(2, numRounds - r - 1);
      const matches = [];
      for (let m = 0; m < matchesInRound; m++) {
        // Populate first round with participants
        let t1 = 'TBD', t2 = 'TBD';
        if (r === 0) {
          t1 = participants[m * 2] || 'BYE';
          t2 = participants[m * 2 + 1] || 'BYE';
        }
        matches.push({ id: `r${r}m${m}`, t1, s1: 0, t2, s2: 0 });
      }
      rounds.push({ name: r === numRounds - 1 ? 'Final' : `Round ${r + 1}`, matches });
    }
    return { rounds, participants };
  };

  // --- LOGIC: AUTO-ADVANCE WINNER ---
  const handleBracketScoreChange = (roundIdx, matchIdx, teamKey, value) => {
    const updatedRounds = [...editForm.bracket_data.rounds];
    const match = updatedRounds[roundIdx].matches[matchIdx];
    
    // Update score
    match[teamKey] = parseInt(value) || 0;

    // Determine winner
    let winner = 'TBD';
    if (match.s1 > match.s2) winner = match.t1;
    else if (match.s2 > match.s1) winner = match.t2;

    // Advance to next round if it exists
    if (roundIdx + 1 < updatedRounds.length) {
      const nextMatchIdx = Math.floor(matchIdx / 2);
      const nextTeamKey = matchIdx % 2 === 0 ? 't1' : 't2';
      updatedRounds[roundIdx + 1].matches[nextMatchIdx][nextTeamKey] = winner;
    }

    setEditForm({
      ...editForm,
      bracket_data: { ...editForm.bracket_data, rounds: updatedRounds }
    });
  };

  const handleSequentialScoreChange = (index, value) => {
    const updatedParticipants = [...editForm.bracket_data.participants];
    updatedParticipants[index] = { 
      ...updatedParticipants[index], 
      score: parseInt(value) || 0 
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
      setTournaments((data || []).map(normalizeTournament));
      setActiveTournamentId((prevId) => {
        if (!data.length) return null;
        if (prevId && data.some((t) => String(t.id) === String(prevId))) return prevId;
        return data[0].id;
      });
    } catch (err) { console.error("Failed to load tournaments:", err); }
  };

  const fetchSchedules = async () => {
    if (!selectedEventId) {
      setScheduleItems([]);
      return;
    }
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
    setEditForm(JSON.parse(JSON.stringify(normalizeTournament(activeTournament))));
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
    if (!String(tournamentForm.name || '').trim()) return alert('Tournament name is required.');
    if ((Number(tournamentForm.participants) || 0) < 2) return alert('At least 2 participants are required.');
    
    let bracket_data;
    if (tournamentForm.format === 'bracket') {
      bracket_data = generateInitialBracket(tournamentForm.participants);
    } else {
      bracket_data = {
        participants: Array.from({ length: Number(tournamentForm.participants) }, (_, i) => ({ name: `Team ${i + 1}`, score: 0 }))
      };
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
      const created = await api.createTournament(newTournamentData, selectedEventId);
      await fetchTournaments();
      setActiveTournamentId(created?.id || newTournamentData.id);
      setIsModalOpen(false); 
      setTournamentForm({name: '', participants: '', format: 'bracket', previewType: 'bracket', externalUrl: ''});
    } catch (err) { alert(err.message); }
  };

  const handleDeleteTournament = async (id) => {
    if (!window.confirm('Delete this tournament?')) return;
    try {
      await api.deleteTournament(id, selectedEventId);
      await fetchTournaments();
      if (activeTournamentId === id) {
        setActiveTournamentId(null);
      }
    } catch (err) { alert(err.message); }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!selectedEventId) return alert('Select an event first.');
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
    } catch (err) {
      alert(err.message);
    }
  };

  if (tournaments.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <Trophy size={48} style={{ opacity: 0.3, margin: '0 auto 1rem' }} />
        <button onClick={() => setIsModalOpen(true)} className="btnSolid">Create First Tournament</button>
        {isModalOpen && <Modal onClose={() => setIsModalOpen(false)} onSubmit={handleCreateTournament} tournamentForm={tournamentForm} setTournamentForm={setTournamentForm} />}
      </div>
    );
  }

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Tournament Management</h1>
        <button onClick={() => setIsModalOpen(true)} className="btnSolid"><Plus size={16} /> New Tournament</button>
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
             <div style={{ flex: '0 0 300px' }}>
               {tournaments.map((t) => (
                 <button key={t.id} onClick={() => setActiveTournamentId(t.id)} style={{ width: '100%', textAlign: 'left', padding: '1rem', marginBottom: '0.5rem', borderRadius: '12px', border: activeTournamentId === t.id ? '2px solid var(--color-primary-dark)' : '1px solid #e2e8f0', background: activeTournamentId === t.id ? '#eff6ff' : 'white' }}>
                   <div style={{ fontWeight: 800 }}>{t.name}</div>
                   <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.format} • {t.status}</div>
                 </button>
               ))}
             </div>

             {/* Right Content Area */}
             <div style={{ flex: 1, minWidth: '400px' }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{activeTournament.name}</h3>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button onClick={handleEditClick} className="btnOutline"><Edit size={14} /> Edit</button>
                    <button onClick={() => handleDeleteTournament(activeTournament.id)} className="btnOutline" style={{ color: '#b91c1c' }}><X size={14} /></button>
                  </div>
               </div>

               {isExternalTournament ? (
                 <iframe src={activeTournament.external_url} style={{ width: '100%', height: '500px', border: '1px solid #e2e8f0', borderRadius: '12px' }} title="External" />
               ) : activeTournament.format === 'bracket' ? (
                 <div style={{ overflowX: 'auto', padding: '1rem', background: '#f8fafc', borderRadius: '12px' }}>
                   <div style={{ display: 'flex', gap: '3rem' }}>
                     {activeTournament.bracket_data?.rounds?.map((round, rIdx) => (
                       <div key={rIdx} style={{ display: 'flex', flexDirection: 'column', gap: '2rem', minWidth: '200px', justifyContent: 'center' }}>
                         <div style={{ fontWeight: 800, fontSize: '0.7rem', color: '#94a3b8', textAlign: 'center' }}>{round.name}</div>
                         {round.matches.map((m, mIdx) => (
                           <div key={mIdx} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                             <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontWeight: m.s1 > m.s2 ? 800 : 400 }}><span>{m.t1}</span><span>{m.s1}</span></div>
                             <div style={{ padding: '0.5rem', display: 'flex', justifyContent: 'space-between', fontWeight: m.s2 > m.s1 ? 800 : 400 }}><span>{m.t2}</span><span>{m.s2}</span></div>
                           </div>
                         ))}
                       </div>
                     ))}
                   </div>
                 </div>
               ) : (
                 <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                   <h4 style={{ marginBottom: '1rem', fontWeight: 800 }}>Sequential Standings</h4>
                   {activeTournament.bracket_data?.participants?.map((p, i) => (
                     <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: 'white', marginBottom: '0.5rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                       <span style={{ fontWeight: 700 }}>{p.name || p}</span>
                       <span style={{ fontWeight: 900, color: 'var(--color-primary-dark)' }}>{p.score || 0} pts</span>
                     </div>
                   ))}
                 </div>
               )}
             </div>
           </div>
         )}
         
         {/* Schedule Tab Content (Simplified from your provided code) */}
         {activeTab === 'schedule' && <ScheduleSection items={scheduleItems} form={scheduleForm} setForm={setScheduleForm} onSave={handleSaveSchedule} onDelete={handleDeleteSchedule} onEdit={handleEditSchedule} editingId={editingScheduleId} setEditingId={setEditingScheduleId} />}
      </div>

      {/* EDIT MODAL WITH DYNAMIC LOGIC */}
      {isEditModalOpen && editForm && (
        <div style={modalOverlayStyle}>
          <div className="animate-fade-in" style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontWeight: 800 }}>Edit Tournament</h2>
              <button onClick={() => setIsEditModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleEditSave}>
              <label>Tournament Name</label>
              <input type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} style={inputStyle} />
              
              <div style={{ marginTop: '1.5rem', background: '#f8fafc', padding: '1rem', borderRadius: '12px' }}>
                <h4 style={{ marginBottom: '1rem' }}>Score Entry</h4>
                
                {editForm.format === 'bracket' ? (
                  (editForm.bracket_data?.rounds || []).map((round, rIdx) => (
                    <div key={rIdx} style={{ marginBottom: '1.5rem' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.75rem', color: '#64748b' }}>{round.name}</div>
                      {round.matches.map((m, mIdx) => (
                        <div key={mIdx} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '0.5rem' }}>
                          <span style={{ flex: 1, fontSize: '0.85rem' }}>{m.t1}</span>
                          <input type="number" value={m.s1} onChange={e => handleBracketScoreChange(rIdx, mIdx, 's1', e.target.value)} style={{ width: '50px' }} />
                          <span>vs</span>
                          <input type="number" value={m.s2} onChange={e => handleBracketScoreChange(rIdx, mIdx, 's2', e.target.value)} style={{ width: '50px' }} />
                          <span style={{ flex: 1, fontSize: '0.85rem', textAlign: 'right' }}>{m.t2}</span>
                        </div>
                      ))}
                    </div>
                  ))
                ) : (
                  (editForm.bracket_data?.participants || []).map((p, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <span>{p.name || p}</span>
                      <input type="number" value={p.score} onChange={e => handleSequentialScoreChange(i, e.target.value)} style={{ width: '80px' }} />
                    </div>
                  ))
                )}
              </div>
              <button type="submit" className="btnSolid" style={{ width: '100%', marginTop: '1.5rem' }}>Save Changes</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// Sub-components & Styles
const Modal = ({ onClose, onSubmit, tournamentForm, setTournamentForm }) => (
  <div style={modalOverlayStyle}>
    <div style={modalContentStyle}>
      <h2 style={{ marginBottom: '1rem' }}>New Tournament</h2>
      <form onSubmit={onSubmit}>
        <input placeholder="Tournament Name" value={tournamentForm.name} onChange={e => setTournamentForm({...tournamentForm, name: e.target.value})} style={inputStyle} required />
        <input type="number" placeholder="Participants" value={tournamentForm.participants} onChange={e => setTournamentForm({...tournamentForm, participants: e.target.value})} style={inputStyle} required />
        <select value={tournamentForm.format} onChange={e => setTournamentForm({...tournamentForm, format: e.target.value})} style={inputStyle}>
          <option value="bracket">Bracket (Elimination)</option>
          <option value="sequential">Sequential (Points)</option>
        </select>
        <button type="submit" className="btnSolid" style={{ width: '100%', marginTop: '1rem' }}>Create</button>
        <button type="button" onClick={onClose} style={{ width: '100%', marginTop: '0.5rem' }}>Cancel</button>
      </form>
    </div>
  </div>
);

const ScheduleSection = ({ items, form, setForm, onSave, onDelete, onEdit, editingId, setEditingId }) => (
  <div style={{ padding: '2rem' }}>
    <form onSubmit={onSave} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 0.5fr', gap: '1rem', marginBottom: '2rem' }}>
      <input placeholder="Match Title" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
      <input type="datetime-local" value={form.session_time} onChange={e => setForm({...form, session_time: e.target.value})} />
      <select value={form.status} onChange={e => setForm({...form, status: e.target.value})}>
        <option value="upcoming">Upcoming</option><option value="active">Active</option><option value="completed">Completed</option>
      </select>
      <button type="submit" className="btnSolid">{editingId ? 'Update' : 'Add'}</button>
    </form>
    {items.map(item => (
      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', borderBottom: '1px solid #eee' }}>
        <div><b>{item.title}</b> - {new Date(item.session_time).toLocaleString()}</div>
        <div><button onClick={() => onEdit(item)}>Edit</button> <button onClick={() => onDelete(item.id)}>Delete</button></div>
      </div>
    ))}
  </div>
);

const modalOverlayStyle = { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalContentStyle = { background: 'white', padding: '2rem', borderRadius: '16px', width: '100%', maxWidth: '500px', maxHeight: '90vh', overflowY: 'auto' };
const inputStyle = { width: '100%', padding: '0.75rem', marginBottom: '1rem', borderRadius: '8px', border: '1px solid #ccc' };