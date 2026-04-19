import React, { useEffect, useState } from 'react';
import { Users, CheckCircle2, Clock, XCircle, Search, Filter, Download, UserPlus, Upload } from 'lucide-react';
import { hostAttendees } from '../../data/mockData';
import { api } from '../../services/api';
import { useEventContext } from '../../contexts/EventContext';

export default function AttendancePage() {
   const { selectedEventId } = useEventContext();
   const [attendees, setAttendees] = useState(hostAttendees);
   const [isLoading, setIsLoading] = useState(true);
   const [searchTerm, setSearchTerm] = useState('');
   const [showFilterOptions, setShowFilterOptions] = useState(false);
   const [ticketFilter, setTicketFilter] = useState('All');
   const [statusFilter, setStatusFilter] = useState('All');

   // Modal State
   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
   const [editingParticipant, setEditingParticipant] = useState(null);

   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
   const [newParticipant, setNewParticipant] = useState({
      name: '',
      email: '',
      type: 'Standard',
      source: 'Website',
      status: 'Absent'
   });

   const loadAttendees = async (eventId) => {
      try {
         const data = await api.getAttendees(eventId);
         setAttendees(data);
      } catch (error) {
         console.error('Failed to load attendees:', error);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      setIsLoading(true);
      loadAttendees(selectedEventId);
   }, [selectedEventId]);

   const stats = {
      total: attendees.length,
      checkedIn: attendees.filter(a => a.status === 'Checked In').length,
      absent: attendees.filter(a => a.status === 'Absent').length
   };

   const progressPercent = stats.total > 0 ? ((stats.checkedIn / stats.total) * 100).toFixed(1) : '0.0';

   const handleCheckIn = async (id) => {
      try {
         await api.updateAttendeeStatus(id, 'Checked In', selectedEventId);
         await loadAttendees(selectedEventId);
      } catch (error) {
         alert('Failed to update status: ' + error.message);
      }
   };

   const handleEditClick = (participant) => {
      setEditingParticipant({ ...participant });
      setIsEditModalOpen(true);
   };

   const handleSaveEdit = async (e) => {
      e.preventDefault();
      try {
         await api.updateAttendeeDetails(editingParticipant.id, editingParticipant, selectedEventId);
         await loadAttendees(selectedEventId);
         setIsEditModalOpen(false);
      } catch (error) {
         alert('Failed to save participant: ' + error.message);
      }
   };

   const filteredAttendees = attendees.filter(a => {
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch =
         searchTerm === '' ||
         [a.name, a.email, a.id, a.type, a.status].some(value =>
            value.toLowerCase().includes(lowerSearch)
         );
      const matchesTicket = ticketFilter === 'All' || a.type === ticketFilter;
      const matchesStatus = statusFilter === 'All' || a.status === statusFilter;

      return matchesSearch && matchesTicket && matchesStatus;
   });

   const handleImportClick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.xlsx, .xls, .csv';
      input.onchange = () => {
         alert('Mock: Excel file imported successfully!');
      };
      input.click();
   };

   const handleAddSubmit = async (e) => {
      e.preventDefault();
      const newId = 'pt_' + Date.now();
      try {
         await api.addAttendee({
            ...newParticipant,
            id: newId,
            event_id: selectedEventId,
            time: newParticipant.status === 'Checked In'
               ? new Date().toLocaleString()
               : '-',
         }, selectedEventId);
         await loadAttendees(selectedEventId);
         setIsAddModalOpen(false);
         setNewParticipant({ name: '', email: '', type: 'Standard', source: 'Website', status: 'Absent' });
      } catch (error) {
         alert('Failed to add participant: ' + error.message);
      }
   };

   const handleExport = () => {
      const headers = ['ID', 'Name', 'Email', 'Ticket Type', 'Source', 'Status', 'Check-in Time'];
      const csvContent = [
         headers.join(','),
         ...attendees.map(a => [
            a.id,
            `"${a.name}"`,
            `"${a.email}"`,
            `"${a.type}"`,
            `"${a.source}"`,
            `"${a.status}"`,
            `"${a.time}"`
         ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', 'attendance_export.csv');
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
   };

   if (isLoading) {
      return (
         <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
               Loading attendance data...
            </div>
         </div>
      );
   }

   return (
      <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
         {/* Header */}
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
            <div>
               <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem', color: 'var(--color-text-main)' }}>Attendance Management</h1>
               <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Track and manage participant check-ins in real-time.</p>
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
               <button onClick={handleExport} className="btnOutline scale-btn hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white' }}>
                  <Download size={16} /> Export
               </button>
               <button onClick={handleImportClick} className="btnOutline scale-btn hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'white' }}>
                  <Upload size={16} /> Import
               </button>
               <button onClick={() => setIsAddModalOpen(true)} className="btnSolid scale-btn hover-lift" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <UserPlus size={16} /> Add Participant
               </button>
            </div>
         </div>

         {/* Top Stats */}
         <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
            {[
               { label: 'Total Registered', val: stats.total, icon: Users, color: '#3b82f6', bg: '#eff6ff' },
               { label: 'Checked In', val: stats.checkedIn, icon: CheckCircle2, color: '#10b981', bg: '#ecfdf5' },
               { label: 'Absent', val: stats.absent, icon: XCircle, color: '#ef4444', bg: '#fef2f2' }
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

         {/* Progress Bar */}
         <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
               <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>Check-in Progress</span>
               <span style={{ fontWeight: 800, color: 'var(--color-primary-light)', fontSize: '1.25rem' }}>{progressPercent}%</span>
            </div>
            <div style={{ width: '100%', height: '12px', background: '#e2e8f0', borderRadius: '99px', overflow: 'hidden', marginBottom: '0.5rem' }}>
               <div style={{ width: `${progressPercent}%`, height: '100%', background: 'linear-gradient(90deg, var(--color-primary-light) 0%, var(--color-success) 100%)', borderRadius: '99px', transition: 'width 1s ease-in-out' }}></div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#64748b' }}>
               <span>{stats.checkedIn} checked in</span>
               <span>{stats.total} total</span>
            </div>
         </div>

         {/* Table Section */}
         <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
            {/* Toolbar */}
            <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', display: 'grid', gridTemplateColumns: '1fr auto', gap: '1rem', alignItems: 'center' }}>
               <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ position: 'relative', flex: '1 1 360px', maxWidth: '100%' }}>
                     <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                     <input
                        type="text"
                        placeholder="Search name, email, ticket type, status, or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', border: '1px solid #e2e8f0', borderRadius: '12px', fontSize: '0.95rem', outline: 'none', minWidth: '220px' }}
                     />
                  </div>
                  <button
                     onClick={() => setShowFilterOptions(!showFilterOptions)}
                     className="btnOutline scale-btn"
                     style={{ padding: '0.75rem 1.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: '120px', justifyContent: 'center' }}
                  >
                     <Filter size={16} /> Filter
                  </button>
               </div>
            </div>
            {showFilterOptions && (
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', alignItems: 'end', padding: '1rem 1.5rem', borderBottom: '1px solid #e2e8f0', background: '#f8fafc' }}>
                  <div>
                     <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem', color: '#475569' }}>Ticket Type</label>
                     <select
                        value={ticketFilter}
                        onChange={(e) => setTicketFilter(e.target.value)}
                        style={{ width: '100%', padding: '0.85rem 0.9rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.95rem' }}
                     >
                        <option value="All">All Ticket Types</option>
                        <option value="VIP Pass">VIP Pass</option>
                        <option value="Standard">Standard</option>
                     </select>
                  </div>
                  <div>
                     <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, marginBottom: '0.35rem', color: '#475569' }}>Status</label>
                     <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ width: '100%', padding: '0.85rem 0.9rem', borderRadius: '12px', border: '1px solid #cbd5e1', background: 'white', fontSize: '0.95rem' }}
                     >
                        <option value="All">All Statuses</option>
                        <option value="Checked In">Checked In</option>
                        <option value="Absent">Absent</option>
                     </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
                     <button
                        onClick={() => {
                           setTicketFilter('All');
                           setStatusFilter('All');
                           setSearchTerm('');
                        }}
                        className="btnOutline scale-btn"
                        style={{ padding: '0.85rem 1.2rem', width: '100%', maxWidth: '200px' }}
                     >
                        Clear Filters
                     </button>
                  </div>
               </div>
            )}

            {/* Data Table */}
            <div style={{ overflowX: 'auto' }}>
               <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                  <thead style={{ background: '#f8fafc', color: '#64748b', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                     <tr>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>ID</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Name</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Ticket / Source</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Status</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600 }}>Check-in Time</th>
                        <th style={{ padding: '1rem 1.5rem', fontWeight: 600, textAlign: 'right' }}>Action</th>
                     </tr>
                  </thead>
                  <tbody>
                     {filteredAttendees.map((p) => {
                        const isCheckedIn = p.status === 'Checked In';
                        const isAbsent = p.status === 'Absent';
                        return (
                           <tr key={p.id} style={{ borderTop: '1px solid #e2e8f0' }} className="hover-lift">
                              <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>{p.id}</td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                 <div style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{p.name}</div>
                                 <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.email}</div>
                              </td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                 <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>{p.type}</div>
                                 <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{p.source}</div>
                              </td>
                              <td style={{ padding: '1rem 1.5rem' }}>
                                 <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
                                    background: isCheckedIn ? '#ecfdf5' : '#fef2f2',
                                    color: isCheckedIn ? '#10b981' : '#ef4444'
                                 }}>
                                    {p.status}
                                 </span>
                              </td>
                              <td style={{ padding: '1rem 1.5rem', color: '#64748b', fontSize: '0.875rem' }}>{p.time}</td>
                              <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                 <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                    {isAbsent && (
                                       <button
                                          onClick={() => handleCheckIn(p.id)}
                                          className="btnSolid scale-btn"
                                          style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', background: 'var(--color-success)' }}
                                       >
                                          Check In
                                       </button>
                                    )}
                                    <button
                                       onClick={() => handleEditClick(p)}
                                       className="btnOutline scale-btn"
                                       style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}
                                    >
                                       Edit
                                    </button>
                                 </div>
                              </td>
                           </tr>
                        )
                     })}
                  </tbody>
               </table>
            </div>
         </div>

         {/* Edit Participant Modal */}
         {isEditModalOpen && editingParticipant && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
               <div className="animate-fade-in" style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                     <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Edit Participant</h2>
                     <button onClick={() => setIsEditModalOpen(false)} style={{ color: '#64748b' }}>
                        <XCircle size={24} />
                     </button>
                  </div>

                  <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                           <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Name</label>
                           <input
                              type="text"
                              value={editingParticipant.name}
                              onChange={(e) => setEditingParticipant({ ...editingParticipant, name: e.target.value })}
                              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                              required
                           />
                        </div>
                        <div>
                           <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Email</label>
                           <input
                              type="email"
                              value={editingParticipant.email}
                              onChange={(e) => setEditingParticipant({ ...editingParticipant, email: e.target.value })}
                              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                              required
                           />
                        </div>
                     </div>

                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                           <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Ticket Type</label>
                           <select
                              value={editingParticipant.type}
                              onChange={(e) => setEditingParticipant({ ...editingParticipant, type: e.target.value })}
                              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: 'white' }}
                           >
                              <option value="Standard">Standard</option>
                              <option value="VIP Pass">VIP Pass</option>
                              <option value="Speaker">Speaker</option>
                           </select>
                        </div>
                        <div>
                           <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Source</label>
                           <select
                              value={editingParticipant.source}
                              onChange={(e) => setEditingParticipant({ ...editingParticipant, source: e.target.value })}
                              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: 'white' }}
                           >
                              <option value="Website">Website</option>
                              <option value="App">App</option>
                              <option value="Sponsor">Sponsor</option>
                           </select>
                        </div>
                     </div>

                     <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Status</label>
                        <select
                           value={editingParticipant.status}
                           onChange={(e) => {
                              const newStatus = e.target.value;
                              const newTime = newStatus === 'Checked In' && editingParticipant.status === 'Absent'
                                 ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                                 : newStatus === 'Absent' ? '-' : editingParticipant.time;
                              setEditingParticipant({ ...editingParticipant, status: newStatus, time: newTime });
                           }}
                           style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: 'white' }}
                        >
                           <option value="Absent">Absent</option>
                           <option value="Checked In">Checked In</option>
                        </select>
                     </div>

                     <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={() => setIsEditModalOpen(false)} className="btnOutline scale-btn" style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" className="btnSolid scale-btn" style={{ flex: 1, background: 'var(--color-primary-dark)' }}>Save Changes</button>
                     </div>
                  </form>
               </div>
            </div>
         )}

         {/* Add Participant Modal */}
         {isAddModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)' }}>
               <div className="animate-fade-in" style={{ background: 'white', borderRadius: '16px', padding: '2rem', width: '100%', maxWidth: '500px', boxShadow: 'var(--shadow-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                     <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Add Participant</h2>
                     <button onClick={() => setIsAddModalOpen(false)} style={{ color: '#64748b' }}>
                        <XCircle size={24} />
                     </button>
                  </div>

                  <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                           <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Name</label>
                           <input
                              type="text"
                              value={newParticipant.name}
                              onChange={(e) => setNewParticipant({ ...newParticipant, name: e.target.value })}
                              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                              required
                           />
                        </div>
                        <div>
                           <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Email</label>
                           <input
                              type="email"
                              value={newParticipant.email}
                              onChange={(e) => setNewParticipant({ ...newParticipant, email: e.target.value })}
                              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none' }}
                              required
                           />
                        </div>
                     </div>

                     <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                           <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Ticket Type</label>
                           <select
                              value={newParticipant.type}
                              onChange={(e) => setNewParticipant({ ...newParticipant, type: e.target.value })}
                              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: 'white' }}
                           >
                              <option value="Standard">Standard</option>
                              <option value="VIP Pass">VIP Pass</option>
                              <option value="Speaker">Speaker</option>
                           </select>
                        </div>
                        <div>
                           <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Source</label>
                           <select
                              value={newParticipant.source}
                              onChange={(e) => setNewParticipant({ ...newParticipant, source: e.target.value })}
                              style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: 'white' }}
                           >
                              <option value="Website">Website</option>
                              <option value="App">App</option>
                              <option value="Sponsor">Sponsor</option>
                           </select>
                        </div>
                     </div>

                     <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem', color: '#475569' }}>Status</label>
                        <select
                           value={newParticipant.status}
                           onChange={(e) => setNewParticipant({ ...newParticipant, status: e.target.value })}
                           style={{ width: '100%', padding: '0.75rem', border: '1px solid #cbd5e1', borderRadius: '8px', outline: 'none', background: 'white' }}
                        >
                           <option value="Absent">Absent</option>
                           <option value="Checked In">Checked In</option>
                        </select>
                     </div>

                     <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                        <button type="button" onClick={() => setIsAddModalOpen(false)} className="btnOutline scale-btn" style={{ flex: 1 }}>Cancel</button>
                        <button type="submit" className="btnSolid scale-btn" style={{ flex: 1, background: 'var(--color-primary-dark)' }}>Add Participant</button>
                     </div>
                  </form>
               </div>
            </div>
         )}
      </div>
   );
}
