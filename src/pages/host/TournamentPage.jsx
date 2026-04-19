import React, { useState, useEffect } from 'react';
import { Trophy, Clock, Plus, Edit, X, ChevronDown } from 'lucide-react';
import { api } from '../../services/api'; 
import { useEventContext } from '../../contexts/EventContext';
// Note: We no longer rely on initialTournaments for the initial state, we fetch from the DB!

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

  // 1. Fetch Tournaments on Load
  const fetchTournaments = async () => {
    if (!selectedEventId) {
      setTournaments([]);
      setActiveTournamentId(null);
      return;
    }

    try {
      const data = await api.getTournaments(selectedEventId);
      setTournaments(data);
      if (data.length > 0 && !activeTournamentId) {
        setActiveTournamentId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to load tournaments:", err);
    }
  };

  const fetchSchedules = async () => {
    if (!selectedEventId) {
      setScheduleItems([]);
      return;
    }

    try {
      const data = await api.getSchedules(selectedEventId);
      setScheduleItems(data);
    } catch (err) {
      console.error('Failed to load schedules:', err);
      setScheduleItems([]);
    }
  };

  useEffect(() => {
    fetchTournaments();
    fetchSchedules();
  }, [selectedEventId]);

  // 2. Handle Edit Modal Open
  const handleEditClick = () => {
    // Deep copy to avoid mutating state directly during edits
    setEditForm(JSON.parse(JSON.stringify(activeTournament)));
    setIsEditModalOpen(true);
  };

  // 3. Handle Saving Edits to DB
  const handleEditSave = async (e) => {
    e.preventDefault();
    try {
      await api.updateTournament(editForm.id, {
        name: editForm.name,
        status: editForm.status,
        preview_type: editForm.preview_type,
        external_url: editForm.external_url,
        format: editForm.format,
        bracket_data: editForm.bracket_data
      }, selectedEventId);
      
      // Refresh the local state
      setTournaments(tournaments.map(t => t.id === editForm.id ? editForm : t));
      setIsEditModalOpen(false);
      alert('Tournament settings updated successfully!');
    } catch (err) {
      alert("Failed to save updates: " + err.message);
    }
  };

  // 4. Handle Creating a New Tournament
  const handleCreateTournament = async (e) => {
    e.preventDefault(); 

    if (!selectedEventId) {
      alert('Please create and select an event before creating tournaments.');
      return;
    }
    
    // Construct the new tournament object matching our database schema
    const newTournamentData = {
      id: `t_${Date.now()}`, // Generate unique ID
      event_id: selectedEventId || 'e_001',
      name: tournamentForm.name,
      status: 'Upcoming',
      format: tournamentForm.format,
      preview_type: tournamentForm.previewType,
      external_url: tournamentForm.previewType === 'external' ? tournamentForm.externalUrl : '',
      bracket_data: {
         participants: tournamentForm.previewType === 'external' ? [] : Array.from({ length: Number(tournamentForm.participants) }, (_, i) => `Team ${i + 1}`),
         matches: tournamentForm.previewType === 'external' ? {} : {
           q1: { t1: 'TBD', s1: '-', t2: 'TBD', s2: '-' },
           q2: { t1: 'TBD', s1: '-', t2: 'TBD', s2: '-' },
           s1: { t1: 'TBD', s1: '-', t2: 'TBD', s2: '-' },
           f1: { t1: 'TBD', s1: '-', t2: 'TBD', s2: '-' }
         }
      }
    };

    try {
      await api.createTournament(newTournamentData, selectedEventId);
      // Re-fetch to ensure sync with DB
      await fetchTournaments();
      setActiveTournamentId(newTournamentData.id);
      setIsModalOpen(false); 
      alert(`Tournament "${tournamentForm.name}" created successfully!`); 
      setTournamentForm({name: '', participants: '', format: 'bracket', previewType: 'bracket', externalUrl: ''});
    } catch (err) {
      alert("Failed to create tournament: " + err.message);
    }
  };

  const handleSaveSchedule = async (e) => {
    e.preventDefault();
    if (!selectedEventId) {
      alert('Please create and select an event first.');
      return;
    }
    try {
      const payload = {
        id: editingScheduleId || `sc_${Date.now()}`,
        title: scheduleForm.title,
        location: scheduleForm.location,
        session_time: scheduleForm.session_time,
        status: scheduleForm.status,
      };

      if (editingScheduleId) {
        await api.updateSchedule(editingScheduleId, payload, selectedEventId);
      } else {
        await api.createSchedule(payload, selectedEventId);
      }

      await fetchSchedules();
      setEditingScheduleId(null);
      setScheduleForm({ title: '', location: '', session_time: '', status: 'upcoming' });
    } catch (err) {
      alert('Failed to save schedule: ' + err.message);
    }
  };

  const handleEditSchedule = (item) => {
    const d = item.session_time ? new Date(item.session_time) : null;
    const dt = d && !Number.isNaN(d.getTime())
      ? `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}T${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      : '';

    setEditingScheduleId(item.id);
    setScheduleForm({
      title: item.title || '',
      location: item.location || '',
      session_time: dt,
      status: item.status || 'upcoming',
    });
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
      alert('Failed to delete schedule: ' + err.message);
    }
  };

  if (tournaments.length === 0) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', textAlign: 'center', padding: '4rem 1rem' }}>
        <Trophy size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-text-main)' }}>No Tournaments Found</h2>
        <button onClick={() => setIsModalOpen(true)} className="btnSolid scale-btn" style={{ padding: '0.75rem 1.5rem', background: 'var(--color-primary-dark)', color: 'white' }}>
          Create First Tournament
        </button>

         {/* Keeping the Create Modal available even when empty */}
        {isModalOpen && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
            <div className="animate-fade-in" style={{ background: 'white', borderRadius: '16px', width: '100%', maxWidth: '440px', overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
              {/* ... Modal Header ... */}
              <div style={{ padding: '1.5rem 2rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>New Tournament</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '0.5rem', borderRadius: '8px' }}><X size={20} /></button>
              </div>
              {/* ... Same Form Body as below ... */}
              <form onSubmit={handleCreateTournament} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'left' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Tournament Name</label>
                  <input type="text" value={tournamentForm.name} onChange={(e) => setTournamentForm({...tournamentForm, name: e.target.value})} required style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Format</label>
                  <select value={tournamentForm.format} onChange={(e) => setTournamentForm({...tournamentForm, format: e.target.value})} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                    <option value="bracket">Bracket (Elimination)</option>
                    <option value="sequential">Sequential (Round Robin)</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Preview Source</label>
                  <select value={tournamentForm.previewType} onChange={(e) => setTournamentForm({...tournamentForm, previewType: e.target.value})} style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }}>
                    <option value="bracket">Internal Bracket</option>
                    <option value="external">External Link</option>
                  </select>
                </div>
                {tournamentForm.previewType === 'external' ? (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>URL</label>
                    <input type="url" value={tournamentForm.externalUrl} onChange={(e) => setTournamentForm({...tournamentForm, externalUrl: e.target.value})} required style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                ) : (
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Participants</label>
                    <input type="number" min="2" value={tournamentForm.participants} onChange={(e) => setTournamentForm({...tournamentForm, participants: e.target.value})} required style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                  </div>
                )}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className="btnOutline scale-btn" style={{ flex: 1, padding: '0.875rem' }}>Cancel</button>
                  <button type="submit" className="btnSolid scale-btn" style={{ flex: 1, padding: '0.875rem', background: 'var(--color-primary-dark)', color: 'white' }}>Create</button>
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
                      // Safe check for participant count since external links don't have participants array
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
                       {activeTournament.external_url ? (
                         <>
                           <iframe
                             src={activeTournament.external_url}
                             title={activeTournament.name}
                             style={{ width: '100%', height: '100%', border: '0' }}
                             loading="lazy"
                           />
                           <div
                             onClick={() => activeTournament.external_url && window.open(activeTournament.external_url, '_blank')}
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
                       onClick={() => activeTournament.external_url && window.open(activeTournament.external_url, '_blank')}
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
                           <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontWeight: activeTournament.bracket_data?.matches?.q1?.s1 > activeTournament.bracket_data?.matches?.q1?.s2 ? 700 : 500, color: activeTournament.bracket_data?.matches?.q1?.s1 > activeTournament.bracket_data?.matches?.q1?.s2 ? 'var(--color-text-main)' : '#64748b', background: activeTournament.bracket_data?.matches?.q1?.s1 > activeTournament.bracket_data?.matches?.q1?.s2 ? 'white' : '#f8fafc' }}><span>{activeTournament.bracket_data?.matches?.q1?.t1}</span><span style={{ color: activeTournament.bracket_data?.matches?.q1?.s1 > activeTournament.bracket_data?.matches?.q1?.s2 ? 'var(--color-primary-dark)' : '#64748b' }}>{activeTournament.bracket_data?.matches?.q1?.s1}</span></div>
                           <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', fontWeight: activeTournament.bracket_data?.matches?.q1?.s2 > activeTournament.bracket_data?.matches?.q1?.s1 ? 700 : 500, color: activeTournament.bracket_data?.matches?.q1?.s2 > activeTournament.bracket_data?.matches?.q1?.s1 ? 'var(--color-text-main)' : '#64748b', background: activeTournament.bracket_data?.matches?.q1?.s2 > activeTournament.bracket_data?.matches?.q1?.s1 ? 'white' : '#f8fafc' }}><span>{activeTournament.bracket_data?.matches?.q1?.t2}</span><span style={{ color: activeTournament.bracket_data?.matches?.q1?.s2 > activeTournament.bracket_data?.matches?.q1?.s1 ? 'var(--color-primary-dark)' : '#64748b' }}>{activeTournament.bracket_data?.matches?.q1?.s2}</span></div>
                         </div>
                         <div className="hover-lift" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', width: '220px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
                           <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontWeight: activeTournament.bracket_data?.matches?.q2?.s1 > activeTournament.bracket_data?.matches?.q2?.s2 ? 700 : 500, color: activeTournament.bracket_data?.matches?.q2?.s1 > activeTournament.bracket_data?.matches?.q2?.s2 ? 'var(--color-text-main)' : '#64748b', background: activeTournament.bracket_data?.matches?.q2?.s1 > activeTournament.bracket_data?.matches?.q2?.s2 ? 'white' : '#f8fafc' }}><span>{activeTournament.bracket_data?.matches?.q2?.t1}</span><span style={{ color: activeTournament.bracket_data?.matches?.q2?.s1 > activeTournament.bracket_data?.matches?.q2?.s2 ? 'var(--color-primary-dark)' : '#64748b' }}>{activeTournament.bracket_data?.matches?.q2?.s1}</span></div>
                           <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', fontWeight: activeTournament.bracket_data?.matches?.q2?.s2 > activeTournament.bracket_data?.matches?.q2?.s1 ? 700 : 500, color: activeTournament.bracket_data?.matches?.q2?.s2 > activeTournament.bracket_data?.matches?.q2?.s1 ? 'var(--color-text-main)' : '#64748b', background: activeTournament.bracket_data?.matches?.q2?.s2 > activeTournament.bracket_data?.matches?.q2?.s1 ? 'white' : '#f8fafc' }}><span>{activeTournament.bracket_data?.matches?.q2?.t2}</span><span style={{ color: activeTournament.bracket_data?.matches?.q2?.s2 > activeTournament.bracket_data?.matches?.q2?.s1 ? 'var(--color-primary-dark)' : '#64748b' }}>{activeTournament.bracket_data?.matches?.q2?.s2}</span></div>
                         </div>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', position: 'relative' }}>
                         <div style={{ position: 'absolute', left: '-2rem', top: '25%', width: '2rem', height: '1px', background: '#cbd5e1' }}></div>
                         <div style={{ position: 'absolute', left: '-2rem', bottom: '25%', width: '2rem', height: '1px', background: '#cbd5e1' }}></div>
                         <div style={{ position: 'absolute', left: '-2rem', top: '25%', width: '1px', height: '50.5%', background: '#cbd5e1' }}></div>
                         <div style={{ position: 'absolute', left: '-2rem', top: '50%', width: '2rem', height: '1px', background: '#cbd5e1' }}></div>
                         <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Semi Finals</div>
                         <div className="hover-lift" style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', width: '220px', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
                           <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f1f5f9', fontWeight: activeTournament.bracket_data?.matches?.s1?.s1 > activeTournament.bracket_data?.matches?.s1?.s2 ? 700 : 500, color: activeTournament.bracket_data?.matches?.s1?.s1 > activeTournament.bracket_data?.matches?.s1?.s2 ? 'var(--color-text-main)' : '#64748b', background: activeTournament.bracket_data?.matches?.s1?.s1 > activeTournament.bracket_data?.matches?.s1?.s2 ? 'white' : '#f8fafc' }}><span>{activeTournament.bracket_data?.matches?.s1?.t1}</span><span style={{ color: activeTournament.bracket_data?.matches?.s1?.s1 > activeTournament.bracket_data?.matches?.s1?.s2 ? 'var(--color-primary-dark)' : '#64748b' }}>{activeTournament.bracket_data?.matches?.s1?.s1}</span></div>
                           <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', fontWeight: activeTournament.bracket_data?.matches?.s1?.s2 > activeTournament.bracket_data?.matches?.s1?.s1 ? 700 : 500, color: activeTournament.bracket_data?.matches?.s1?.s2 > activeTournament.bracket_data?.matches?.s1?.s1 ? 'var(--color-text-main)' : '#64748b', background: activeTournament.bracket_data?.matches?.s1?.s2 > activeTournament.bracket_data?.matches?.s1?.s1 ? 'white' : '#f8fafc' }}><span>{activeTournament.bracket_data?.matches?.s1?.t2}</span><span style={{ color: activeTournament.bracket_data?.matches?.s1?.s2 > activeTournament.bracket_data?.matches?.s1?.s1 ? 'var(--color-primary-dark)' : '#64748b' }}>{activeTournament.bracket_data?.matches?.s1?.s2}</span></div>
                         </div>
                       </div>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '4rem', position: 'relative' }}>
                         <div style={{ position: 'absolute', left: '-2rem', top: '50%', width: '2rem', height: '1px', background: '#cbd5e1' }}></div>
                         <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Trophy size={14} /> Grand Final</div>
                         <div className="hover-lift" style={{ background: 'white', border: '2px solid #f59e0b', borderRadius: '8px', width: '220px', overflow: 'hidden', boxShadow: '0 10px 15px -3px rgba(245,158,11,0.2)' }}>
                           <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #fcf3c0', fontWeight: 800, color: 'var(--color-text-main)', background: '#fffbeb' }}><span>{activeTournament.bracket_data?.matches?.f1?.t1}</span><span style={{ color: 'var(--color-primary-dark)' }}>{activeTournament.bracket_data?.matches?.f1?.s1}</span></div>
                           <div style={{ padding: '0.75rem 1rem', display: 'flex', justifyContent: 'space-between', fontWeight: 500, color: '#64748b', background: 'white' }}><span>{activeTournament.bracket_data?.matches?.f1?.t2}</span><span>{activeTournament.bracket_data?.matches?.f1?.s2}</span></div>
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
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Tournament Schedule</h3>

              <form onSubmit={handleSaveSchedule} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr 0.8fr', gap: '0.75rem', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1rem' }}>
                <input
                  value={scheduleForm.title}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, title: e.target.value })}
                  placeholder="Match / Session title"
                  required
                  style={{ padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
                <input
                  value={scheduleForm.location}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, location: e.target.value })}
                  placeholder="Location"
                  style={{ padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
                <input
                  type="datetime-local"
                  value={scheduleForm.session_time}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, session_time: e.target.value })}
                  required
                  style={{ padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px' }}
                />
                <select
                  value={scheduleForm.status}
                  onChange={(e) => setScheduleForm({ ...scheduleForm, status: e.target.value })}
                  style={{ padding: '0.7rem', border: '1px solid #cbd5e1', borderRadius: '8px', background: 'white' }}
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                <div style={{ gridColumn: '1 / -1', display: 'flex', gap: '0.5rem' }}>
                  <button type="submit" className="btnSolid scale-btn" style={{ background: 'var(--color-primary-dark)', padding: '0.55rem 1rem' }}>
                    {editingScheduleId ? 'Update Item' : 'Add Item'}
                  </button>
                  {editingScheduleId && (
                    <button
                      type="button"
                      className="btnOutline scale-btn"
                      style={{ padding: '0.55rem 1rem' }}
                      onClick={() => {
                        setEditingScheduleId(null);
                        setScheduleForm({ title: '', location: '', session_time: '', status: 'upcoming' });
                      }}
                    >
                      Cancel Edit
                    </button>
                  )}
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
                  <option value="Completed">Completed</option>
                </select>
              </div>
              
              {editForm.preview_type === 'external' ? (
                 <div>
                   <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>External Link</label>
                   <input 
                      type="url" 
                      value={editForm.external_url || ''} 
                      onChange={(e) => setEditForm({...editForm, external_url: e.target.value})} 
                      required 
                      style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem' }} 
                   />
                 </div>
              ) : (
                <>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>Manage Participants</label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem', padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '8px', minHeight: '42px', background: '#f8fafc' }}>
                      {editForm.bracket_data?.participants?.map((p, i) => (
                        <div key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', background: 'white', border: '1px solid #cbd5e1', padding: '0.25rem 0.625rem', borderRadius: '99px', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-main)', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                          {p}
                          <button 
                            type="button" 
                            onClick={() => setEditForm({
                                ...editForm, 
                                bracket_data: {
                                    ...editForm.bracket_data,
                                    participants: editForm.bracket_data.participants.filter((_, index) => index !== i)
                                }
                            })}
                            style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 0 }}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                      {(!editForm.bracket_data?.participants || editForm.bracket_data.participants.length === 0) && <span style={{ color: '#94a3b8', fontSize: '0.875rem', padding: '0.25rem' }}>No participants added yet.</span>}
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
                            if (val && !editForm.bracket_data.participants.includes(val)) {
                              setEditForm({
                                  ...editForm, 
                                  bracket_data: {
                                      ...editForm.bracket_data,
                                      participants: [...(editForm.bracket_data.participants || []), val]
                                  }
                              });
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
                          if (val && !editForm.bracket_data.participants.includes(val)) {
                             setEditForm({
                                  ...editForm, 
                                  bracket_data: {
                                      ...editForm.bracket_data,
                                      participants: [...(editForm.bracket_data.participants || []), val]
                                  }
                              });
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
                     <h4 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '1rem', color: 'var(--color-text-main)' }}>Bracket Scores</h4>
                     <p style={{fontSize: '0.85rem', color: '#64748b', marginBottom: '1rem'}}>Update the scores to progress the bracket. Highest score wins.</p>
                     
                     <div style={{ display: 'grid', gap: '1rem' }}>
                        {/* Q1 Match */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                           <div style={{ fontSize: '0.75rem', fontWeight: 700, width: '40px' }}>Q1:</div>
                           <select value={editForm.bracket_data.matches.q1.t1} onChange={(e) => setEditForm({...editForm, bracket_data: {...editForm.bracket_data, matches: {...editForm.bracket_data.matches, q1: {...editForm.bracket_data.matches.q1, t1: e.target.value}}}})} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                              <option value="TBD">TBD</option>
                              {editForm.bracket_data.participants?.map((p, i) => <option key={i} value={p}>{p}</option>)}
                           </select>
                           <input type="number" value={editForm.bracket_data.matches.q1.s1} onChange={(e) => setEditForm({...editForm, bracket_data: {...editForm.bracket_data, matches: {...editForm.bracket_data.matches, q1: {...editForm.bracket_data.matches.q1, s1: e.target.value}}}})} style={{width: '60px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1'}} />
                           <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>VS</span>
                           <input type="number" value={editForm.bracket_data.matches.q1.s2} onChange={(e) => setEditForm({...editForm, bracket_data: {...editForm.bracket_data, matches: {...editForm.bracket_data.matches, q1: {...editForm.bracket_data.matches.q1, s2: e.target.value}}}})} style={{width: '60px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1'}} />
                           <select value={editForm.bracket_data.matches.q1.t2} onChange={(e) => setEditForm({...editForm, bracket_data: {...editForm.bracket_data, matches: {...editForm.bracket_data.matches, q1: {...editForm.bracket_data.matches.q1, t2: e.target.value}}}})} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                              <option value="TBD">TBD</option>
                              {editForm.bracket_data.participants?.map((p, i) => <option key={i} value={p}>{p}</option>)}
                           </select>
                        </div>

                        {/* Q2 Match */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                           <div style={{ fontSize: '0.75rem', fontWeight: 700, width: '40px' }}>Q2:</div>
                           <select value={editForm.bracket_data.matches.q2.t1} onChange={(e) => setEditForm({...editForm, bracket_data: {...editForm.bracket_data, matches: {...editForm.bracket_data.matches, q2: {...editForm.bracket_data.matches.q2, t1: e.target.value}}}})} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                              <option value="TBD">TBD</option>
                              {editForm.bracket_data.participants?.map((p, i) => <option key={i} value={p}>{p}</option>)}
                           </select>
                           <input type="number" value={editForm.bracket_data.matches.q2.s1} onChange={(e) => setEditForm({...editForm, bracket_data: {...editForm.bracket_data, matches: {...editForm.bracket_data.matches, q2: {...editForm.bracket_data.matches.q2, s1: e.target.value}}}})} style={{width: '60px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1'}} />
                           <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>VS</span>
                           <input type="number" value={editForm.bracket_data.matches.q2.s2} onChange={(e) => setEditForm({...editForm, bracket_data: {...editForm.bracket_data, matches: {...editForm.bracket_data.matches, q2: {...editForm.bracket_data.matches.q2, s2: e.target.value}}}})} style={{width: '60px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1'}} />
                           <select value={editForm.bracket_data.matches.q2.t2} onChange={(e) => setEditForm({...editForm, bracket_data: {...editForm.bracket_data, matches: {...editForm.bracket_data.matches, q2: {...editForm.bracket_data.matches.q2, t2: e.target.value}}}})} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                              <option value="TBD">TBD</option>
                              {editForm.bracket_data.participants?.map((p, i) => <option key={i} value={p}>{p}</option>)}
                           </select>
                        </div>

                        {/* S1 Match */}
                        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                           <div style={{ fontSize: '0.75rem', fontWeight: 700, width: '40px' }}>S1:</div>
                           <select value={editForm.bracket_data.matches.s1.t1} onChange={(e) => setEditForm({...editForm, bracket_data: {...editForm.bracket_data, matches: {...editForm.bracket_data.matches, s1: {...editForm.bracket_data.matches.s1, t1: e.target.value}}}})} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                              <option value="TBD">TBD</option>
                              {editForm.bracket_data.participants?.map((p, i) => <option key={i} value={p}>{p}</option>)}
                              <option value="Winner Q1">Winner Q1</option>
                           </select>
                           <input type="number" value={editForm.bracket_data.matches.s1.s1} onChange={(e) => setEditForm({...editForm, bracket_data: {...editForm.bracket_data, matches: {...editForm.bracket_data.matches, s1: {...editForm.bracket_data.matches.s1, s1: e.target.value}}}})} style={{width: '60px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1'}} />
                           <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>VS</span>
                           <input type="number" value={editForm.bracket_data.matches.s1.s2} onChange={(e) => setEditForm({...editForm, bracket_data: {...editForm.bracket_data, matches: {...editForm.bracket_data.matches, s1: {...editForm.bracket_data.matches.s1, s2: e.target.value}}}})} style={{width: '60px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1'}} />
                           <select value={editForm.bracket_data.matches.s1.t2} onChange={(e) => setEditForm({...editForm, bracket_data: {...editForm.bracket_data, matches: {...editForm.bracket_data.matches, s1: {...editForm.bracket_data.matches.s1, t2: e.target.value}}}})} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                              <option value="TBD">TBD</option>
                              {editForm.bracket_data.participants?.map((p, i) => <option key={i} value={p}>{p}</option>)}
                              <option value="Winner Q2">Winner Q2</option>
                           </select>
                        </div>
                        
                         {/* F1 Match */}
                         <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                           <div style={{ fontSize: '0.75rem', fontWeight: 700, width: '40px' }}>Final:</div>
                           <select value={editForm.bracket_data.matches.f1.t1} onChange={(e) => setEditForm({...editForm, bracket_data: {...editForm.bracket_data, matches: {...editForm.bracket_data.matches, f1: {...editForm.bracket_data.matches.f1, t1: e.target.value}}}})} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                              <option value="TBD">TBD</option>
                              {editForm.bracket_data.participants?.map((p, i) => <option key={i} value={p}>{p}</option>)}
                              <option value="Winner S1">Winner S1</option>
                           </select>
                           <input type="number" value={editForm.bracket_data.matches.f1.s1} onChange={(e) => setEditForm({...editForm, bracket_data: {...editForm.bracket_data, matches: {...editForm.bracket_data.matches, f1: {...editForm.bracket_data.matches.f1, s1: e.target.value}}}})} style={{width: '60px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1'}} />
                           <span style={{ fontSize: '0.75rem', fontWeight: 700 }}>VS</span>
                           <input type="number" value={editForm.bracket_data.matches.f1.s2} onChange={(e) => setEditForm({...editForm, bracket_data: {...editForm.bracket_data, matches: {...editForm.bracket_data.matches, f1: {...editForm.bracket_data.matches.f1, s2: e.target.value}}}})} style={{width: '60px', padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1'}} />
                           <select value={editForm.bracket_data.matches.f1.t2} onChange={(e) => setEditForm({...editForm, bracket_data: {...editForm.bracket_data, matches: {...editForm.bracket_data.matches, f1: {...editForm.bracket_data.matches.f1, t2: e.target.value}}}})} style={{ flex: 1, padding: '0.5rem', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                              <option value="TBD">TBD</option>
                              {editForm.bracket_data.participants?.map((p, i) => <option key={i} value={p}>{p}</option>)}
                           </select>
                        </div>
                     </div>
                  </div>
                </>
              )}

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
            
            <form onSubmit={handleCreateTournament} style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
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
                  <option value="bracket">Internal Bracket Preview</option>
                  <option value="external">External Website Link</option>
                </select>
              </div>

              {tournamentForm.previewType === 'external' ? (
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', color: '#475569' }}>External Website URL</label>
                  <input
                    type="url"
                    value={tournamentForm.externalUrl}
                    onChange={(e) => setTournamentForm({...tournamentForm, externalUrl: e.target.value})}
                    required
                    placeholder="https://challonge.com/my-tourney"
                    style={{ width: '100%', padding: '0.875rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', fontSize: '0.95rem', transition: 'border-color 0.2s', boxSizing: 'border-box' }}
                  />
                </div>
              ) : (
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