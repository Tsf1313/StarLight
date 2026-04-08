import React, { useState } from 'react';
import { Map, MapPin } from 'lucide-react';
import { initialMaps } from '../../data/mockData';

export default function GuestVenueMapPage() {
  const [activeMapId, setActiveMapId] = useState(initialMaps.length > 0 ? initialMaps[0].id : null);
  
  const activeMap = initialMaps.find(m => m.id === activeMapId);

  return (
    <div className="animate-fade-in" style={{ padding: '1.25rem', paddingBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ padding: '0.75rem', background: 'var(--color-primary)', borderRadius: '12px', color: 'white' }}>
          <Map size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--color-text-main)' }}>Venue Map</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Interactive Floorplans</p>
        </div>
      </div>

      {initialMaps.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#94a3b8', background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <Map size={48} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
            <p style={{ fontSize: '0.875rem' }}>No layout maps available yet.</p>
        </div>
      ) : (
        <>
          {/* Map Selector */}
          {initialMaps.length > 1 && (
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Select Level / Area</label>
              <select 
                value={activeMapId} 
                onChange={(e) => setActiveMapId(Number(e.target.value))}
                style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none', background: 'white', fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-text-main)', boxShadow: 'var(--shadow-sm)' }}
              >
                {initialMaps.map(m => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
          )}

          {activeMap && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Map Bounds */}
              <div style={{ width: '100%', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: 'var(--shadow-xl)', position: 'relative' }}>
                 <div style={{ position: 'relative', width: '100%', paddingBottom: '100%', background: '#f8fafc', overflow: 'hidden' }}>
                    
                    {activeMap.image ? (
                       <img src={activeMap.image} alt={activeMap.name} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                       <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '0.5rem' }}>
                          <Map size={48} opacity={0.3} />
                          <span>Floorplan Image Missing</span>
                       </div>
                    )}
                    
                    {/* Render Zones */}
                    {activeMap.zones.map(zone => (
                       <div 
                         key={zone.id} 
                         style={{ position: 'absolute', left: `${zone.x}%`, top: `${zone.y}%`, transform: 'translate(-50%, -100%)', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                         className="hover-lift"
                       >
                          <div style={{ background: 'white', padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.625rem', fontWeight: 800, color: '#0f172a', whiteSpace: 'nowrap', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '4px', border: `1px solid ${zone.color}` }}>
                             {zone.name}
                          </div>
                          <MapPin size={24} color={zone.color} fill="white" />
                       </div>
                    ))}
                 </div>
              </div>

              {/* Legend List */}
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: 'var(--shadow-sm)' }}>
                 <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--color-text-main)', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Locations</h3>
                 <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.875rem' }}>
                    {activeMap.zones.map(zone => (
                       <div key={zone.id} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ width: '12px', height: '12px', borderRadius: '4px', background: zone.color, flexShrink: 0 }}></div>
                          <span style={{ fontSize: '0.875rem', color: '#475569', fontWeight: 500 }}>{zone.name}</span>
                       </div>
                    ))}
                 </div>
                 {activeMap.zones.length === 0 && <span style={{ fontSize: '0.875rem', color: '#94a3b8' }}>No locations plotted on this map.</span>}
              </div>

            </div>
          )}
        </>
      )}
    </div>
  );
}
