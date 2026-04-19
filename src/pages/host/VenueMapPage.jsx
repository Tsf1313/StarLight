import React, { useEffect, useState } from 'react';
import { Plus, Trash2, Map as MapIcon, Image as ImageIcon, MapPin, CheckCircle2, Edit3, X } from 'lucide-react';
import { api } from '../../services/api';
import { useEventContext } from '../../contexts/EventContext';

export default function VenueMapPage() {
  const { selectedEventId } = useEventContext();
  const [isPublishing, setIsPublishing] = useState(false);
  const [published, setPublished] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const colors = ['#3b82f6', '#f59e0b', '#10b981', '#64748b', '#ef4444', '#8b5cf6'];

  const [maps, setMaps] = useState([]);
  const [activeMapId, setActiveMapId] = useState(null);
  const [editingMapNameId, setEditingMapNameId] = useState(null);

  const activeMap = maps.find(m => m.id === activeMapId) || maps[0] || {
    id: 'fallback-map',
    name: 'Map',
    image: null,
    zones: [],
    activeZoneId: null,
  };

  const loadVenueMaps = async (eventId) => {
    try {
      const data = await api.getVenueMaps(eventId);
      const nextMaps = data || [];
      setMaps(nextMaps);
      if (nextMaps.length > 0) {
        setActiveMapId(nextMaps[0].id);
      } else {
        const starterId = `${eventId || 'e_001'}_map_${Date.now()}`;
        setMaps([{ id: starterId, name: 'Floor 1', image: null, zones: [], activeZoneId: null }]);
        setActiveMapId(starterId);
      }
    } catch (error) {
      console.error('Failed to load venue maps:', error);
      const starterId = `${eventId || 'e_001'}_map_${Date.now()}`;
      setMaps([{ id: starterId, name: 'Floor 1', image: null, zones: [], activeZoneId: null }]);
      setActiveMapId(starterId);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    loadVenueMaps(selectedEventId);
  }, [selectedEventId]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await api.replaceVenueMaps(maps, selectedEventId);
      setPublished(true);
      setTimeout(() => setPublished(false), 3000);
      await loadVenueMaps(selectedEventId);
    } catch (error) {
      alert('Failed to publish venue maps: ' + error.message);
    } finally {
      setIsPublishing(false);
    }
  };

  const addMap = () => {
    const newMapId = `${selectedEventId || 'e_001'}_map_${Date.now()}`;
    setMaps([...maps, {
      id: newMapId,
      name: `Floor ${maps.length + 1}`,
      image: null,
      zones: [],
      activeZoneId: null
    }]);
    setActiveMapId(newMapId);
    setEditingMapNameId(newMapId);
  };

  const updateMapName = (id, newName) => {
    setMaps(maps.map(m => m.id === id ? { ...m, name: newName } : m));
  };

  const removeMap = (e, id) => {
    e.stopPropagation();
    if (maps.length <= 1) return; // Prevent deleting the last map
    const newMaps = maps.filter(m => m.id !== id);
    setMaps(newMaps);
    if (activeMapId === id) setActiveMapId(newMaps[0].id);
  };

  const handleImageUpload = async (e) => {
    if (e.target.files && e.target.files[0]) {
      let url = '';
      try {
        const uploadResult = await api.uploadImage(e.target.files[0]);
        url = uploadResult.url;
      } catch (error) {
        alert('Failed to upload floorplan image: ' + error.message);
        return;
      }
      setMaps(maps.map(m => m.id === activeMapId ? { ...m, image: url } : m));
    }
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto' }}>
        <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '2rem', textAlign: 'center', color: '#64748b' }}>
          Loading venue maps...
        </div>
      </div>
    );
  }

  const addZone = () => {
    const newZoneId = Date.now();
    const newZone = {
      id: newZoneId,
      name: `New Zone`,
      color: colors[activeMap.zones.length % colors.length],
      x: null,
      y: null
    };
    setMaps(maps.map(m => m.id === activeMapId ? {
      ...m,
      zones: [...m.zones, newZone],
      activeZoneId: newZoneId
    } : m));
  };

  const updateZoneName = (zoneId, name) => {
    setMaps(maps.map(m => m.id === activeMapId ? {
      ...m,
      zones: m.zones.map(z => z.id === zoneId ? { ...z, name } : z)
    } : m));
  };

  const removeZone = (zoneId) => {
    setMaps(maps.map(m => m.id === activeMapId ? {
      ...m,
      zones: m.zones.filter(z => z.id !== zoneId),
      activeZoneId: m.activeZoneId === zoneId ? null : m.activeZoneId
    } : m));
  };

  const setActiveZoneId = (zoneId) => {
    setMaps(maps.map(m => m.id === activeMapId ? { ...m, activeZoneId: zoneId } : m));
  };

  const handleMapClick = (e) => {
    if (!activeMap.activeZoneId || !activeMap.image) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setMaps(maps.map(m => m.id === activeMapId ? {
      ...m,
      zones: m.zones.map(z => z.id === m.activeZoneId ? { ...z, x, y } : z)
    } : m));
  };

  return (
    <div className="animate-fade-in" style={{ maxWidth: '1400px', margin: '0 auto', height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexShrink: 0 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.25rem' }}>Venue Map Editor</h1>
          <p style={{ color: '#64748b', fontSize: '0.875rem' }}>Manage multiple floorplans and place navigation pins for participants.</p>
        </div>
        <button
          onClick={handlePublish}
          disabled={isPublishing}
          className="btnSolid hover-lift"
          style={{
            background: published ? '#10b981' : 'var(--color-primary-dark)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1.75rem',
            borderRadius: '8px',
            color: 'white',
            fontWeight: 600,
            transition: 'all 0.3s ease',
            opacity: isPublishing ? 0.7 : 1,
            cursor: isPublishing ? 'not-allowed' : 'pointer',
            border: 'none',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
          {isPublishing ? (
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>↻</span>
          ) : published ? (
            <CheckCircle2 size={18} />
          ) : null}
          {isPublishing ? 'Publishing...' : published ? 'All Maps Published!' : 'Publish Global Maps'}
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', flex: 1, minHeight: 0, marginBottom: '1rem' }}>
        {/* Map List Sidebar */}
        <div style={{ width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', background: 'white', border: '1px solid #e2e8f0', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ padding: '1rem 1rem 0.75rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Venue Floors</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.25rem' }}>{maps.length} maps</div>
            </div>
            <button
              onClick={addMap}
              className="btnOutline scale-btn hover-lift"
              style={{ padding: '0.45rem 0.9rem', fontSize: '0.825rem', borderRadius: '999px' }}
            >
              + Add
            </button>
          </div>
          <div style={{ padding: '0.75rem', overflowY: 'auto', flex: 1, minHeight: 0 }}>
            {maps.map((map) => {
              const isSelected = map.id === activeMapId;
              return (
                <div
                  key={map.id}
                  onClick={() => setActiveMapId(map.id)}
                  className="hover-lift"
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    padding: '1rem',
                    borderRadius: '18px',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid #e2e8f0',
                    background: isSelected ? '#eff6ff' : 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    marginBottom: '0.85rem',
                    minHeight: '140px',
                    boxShadow: isSelected ? '0 12px 24px rgba(59,130,246,0.08)' : '0 6px 16px rgba(15,23,42,0.04)'
                  }}
                >
                  <div style={{ borderRadius: '14px', height: '90px', overflow: 'hidden', backgroundColor: '#f8fafc', backgroundImage: map.image ? 'url(' + map.image + ')' : 'none', backgroundSize: 'cover', backgroundPosition: 'center' }}>
                    {!map.image && (
                      <div style={{ textAlign: 'center', color: '#94a3b8' }}>
                        <MapIcon size={24} />
                        <div style={{ fontSize: '0.75rem', marginTop: '0.35rem' }}>No preview</div>
                      </div>
                    )}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <div style={{ minWidth: 0 }}>
                      {editingMapNameId === map.id ? (
                        <input
                          autoFocus
                          type="text"
                          value={map.name}
                          onChange={(e) => updateMapName(map.id, e.target.value)}
                          onBlur={() => setEditingMapNameId(null)}
                          onKeyDown={(e) => e.key === 'Enter' && setEditingMapNameId(null)}
                          style={{ width: '100%', border: '1px solid #d1d5db', borderRadius: '10px', padding: '0.45rem 0.75rem', fontSize: '0.95rem', fontWeight: 700, outline: 'none' }}
                        />
                      ) : (
                        <div style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{map.name}</div>
                      )}
                      <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span>{map.zones.length} zones</span>
                        <span style={{ padding: '0.15rem 0.55rem', background: '#eef2ff', borderRadius: '999px', color: '#4338ca', fontSize: '0.75rem', fontWeight: 700 }}>{map.image ? 'Has Plan' : 'Empty'}</span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0 }}>
                      <button onClick={(e) => { e.stopPropagation(); setEditingMapNameId(map.id); }} style={{ background: 'transparent', border: 'none', padding: '0.35rem', cursor: 'pointer', color: '#475569' }} title="Rename Map">
                        <Edit3 size={16} />
                      </button>
                      {maps.length > 1 && (
                        <button onClick={(e) => removeMap(e, map.id)} style={{ background: 'transparent', border: 'none', padding: '0.35rem', cursor: 'pointer', color: '#ef4444' }} title="Delete Map">
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div style={{ flex: 1, display: 'flex', gap: '1.5rem', minHeight: 0 }}>
          <div style={{ flex: 3, background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', position: 'relative', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, background: '#f1f5f9', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <div style={{ width: '100%', height: '100%', backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px', position: 'absolute', pointerEvents: 'none' }}></div>

              {!activeMap.image ? (
                <div className="animate-fade-in" style={{ textAlign: 'center', position: 'relative', zIndex: 10, background: 'white', padding: '3rem 4rem', borderRadius: '16px', boxShadow: 'var(--shadow-xl)' }}>
                  <MapIcon size={64} color="var(--color-primary)" style={{ margin: '0 auto 1.5rem' }} />
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a', marginBottom: '0.5rem' }}>No Floorplan for '{activeMap.name}'</h3>
                  <p style={{ color: '#64748b', marginBottom: '2rem' }}>Upload a base floorplan image to begin plotting zones on this map.</p>
                  <label className="btnSolid scale-btn hover-lift" style={{ background: 'var(--color-primary)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.875rem 2rem', color: 'white', fontWeight: 600, borderRadius: '8px' }}>
                    <ImageIcon size={20} /> Upload Level Image
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                  </label>
                </div>
              ) : (
                <div
                  key={activeMap.id}
                  className="animate-fade-in"
                  style={{ position: 'relative', maxWidth: '100%', maxHeight: '100%', cursor: activeMap.activeZoneId ? 'crosshair' : 'default', border: '4px solid white', borderRadius: '12px', overflow: 'hidden', background: 'white', boxShadow: 'var(--shadow-lg)' }}
                  onClick={handleMapClick}
                >
                  <img src={activeMap.image} alt="Venue Map" style={{ display: 'block', maxWidth: '100%', maxHeight: 'calc(100vh - 300px)', objectFit: 'contain', pointerEvents: 'none' }} />

                  {activeMap.zones.map((zone) =>
                    zone.x !== null && zone.y !== null ? (
                      <div
                        key={`pin-${zone.id}`}
                        style={{
                          position: 'absolute',
                          left: `${zone.x}%`,
                          top: `${zone.y}%`,
                          transform: 'translate(-50%, -100%)',
                          display: 'flex',
                          flexDirection: 'column',
                          alignItems: 'center',
                          pointerEvents: 'none',
                          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                      >
                        <div style={{ background: 'rgba(255,255,255,0.95)', padding: '4px 8px', border: '1px solid ' + zone.color, borderRadius: '6px', fontSize: '12px', fontWeight: 800, color: '#0f172a', marginBottom: '4px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', whiteSpace: 'nowrap' }}>
                          {zone.name}
                        </div>
                        <MapPin size={36} color={zone.color} fill={zone.color} style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.4))' }} />
                      </div>
                    ) : null
                  )}

                  {activeMap.activeZoneId && (
                    <div style={{ position: 'absolute', bottom: '1.5rem', left: '50%', transform: 'translateX(-50%)', background: 'rgba(15, 23, 42, 0.85)', color: 'white', padding: '0.75rem 1.5rem', borderRadius: '32px', fontSize: '0.875rem', fontWeight: 600, pointerEvents: 'none', backdropFilter: 'blur(8px)', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', animation: 'pulse 2s infinite' }}>
                      Click anywhere on '{activeMap.name}' to place the pin
                    </div>
                  )}
                </div>
              )}
            </div>

            {activeMap.image && (
              <div style={{ position: 'absolute', top: '1rem', right: '1rem', zIndex: 20 }}>
                <label className="btnSolid hover-lift" style={{ background: 'white', color: '#0f172a', border: '1px solid #e2e8f0', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', fontWeight: 700, fontSize: '0.875rem', borderRadius: '8px', boxShadow: 'var(--shadow-md)' }}>
                  <ImageIcon size={16} /> Replace Floorplan
                  <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
                </label>
              </div>
            )}
          </div>

          <div style={{ flex: 1, background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', minWidth: '350px' }}>
            <div style={{ padding: '1.25rem', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontWeight: 800, fontSize: '1.125rem' }}>{activeMap.name} Zones</h3>
              <button onClick={addZone} disabled={!activeMap.image} className="btnSolid scale-btn hover-lift" style={{ background: activeMap.image ? 'var(--color-primary)' : '#cbd5e1', cursor: activeMap.image ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', borderRadius: '8px', fontSize: '0.875rem', fontWeight: 600 }}>
                <Plus size={16} /> Add Zone
              </button>
            </div>

            <div style={{ padding: '1rem', overflowY: 'auto', flex: 1, background: '#f8fafc' }}>
              {!activeMap.image ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '3rem' }}>
                  <MapIcon size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p style={{ fontWeight: 500 }}>Upload a floorplan to add zones.</p>
                </div>
              ) : activeMap.zones.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#94a3b8', marginTop: '3rem' }}>
                  <MapPin size={48} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                  <p style={{ fontWeight: 500 }}>No zones added to {activeMap.name}.</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {activeMap.zones.map((zone) => (
                    <div
                      key={zone.id}
                      onClick={() => setActiveZoneId(zone.id)}
                      style={{
                        border: activeMap.activeZoneId === zone.id ? `2px solid ${zone.color}` : '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: 'white',
                        cursor: 'pointer',
                        boxShadow: activeMap.activeZoneId === zone.id ? `0 4px 12px ${zone.color}30` : '0 1px 2px rgba(0,0,0,0.05)',
                        transform: activeMap.activeZoneId === zone.id ? 'translateY(-2px)' : 'none',
                        transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ width: '16px', height: '16px', borderRadius: '4px', background: zone.color, flexShrink: 0 }}></div>
                      <div style={{ flex: 1 }}>
                        <input
                          type="text"
                          value={zone.name}
                          onChange={(e) => updateZoneName(zone.id, e.target.value)}
                          onClick={(e) => e.stopPropagation()}
                          style={{ fontSize: '0.875rem', fontWeight: 700, color: '#0f172a', border: 'none', background: 'transparent', width: '100%', outline: 'none' }}
                          placeholder="Enter Zone Name..."
                        />
                        <div style={{ fontSize: '0.75rem', fontWeight: 600, color: zone.x !== null ? '#10b981' : '#f59e0b', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          {zone.x !== null ? '✓ Pin Placed Successfully' : '⚠️ Pending Placement (Click Here)'}
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); removeZone(zone.id); }}
                        className="hover-lift"
                        style={{ color: 'var(--color-danger)', padding: '0.5rem', background: '#fef2f2', borderRadius: '6px', border: 'none', cursor: 'pointer' }}
                        title="Delete Zone"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
