import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom'; // NEW: Hook to catch the theme
import { Map, MapPin } from 'lucide-react';
import { initialMaps } from '../../data/mockData';

export default function GuestVenueMapPage() {
  const [activeMapId, setActiveMapId] = useState(initialMaps.length > 0 ? initialMaps[0].id : null);
  
  // Catch the custom theme passed down from GuestLayout
  const { theme } = useOutletContext();

  const activeMap = initialMaps.find(m => m.id === activeMapId);

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
          <Map size={24} />
        </div>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f172a' }}>Venue Map</h1>
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
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: '#64748b', marginBottom: '0.75rem', textTransform: 'uppercase' }}>Select Level / Area</label>
              <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto', paddingBottom: '0.5rem', WebkitOverflowScrolling: 'touch' }}>
                {initialMaps.map((m) => {
                  const isSelected = activeMapId === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setActiveMapId(m.id)}
                      className="hover-lift"
                      style={{
                        flex: '0 0 240px',
                        display: 'flex',
                        flexDirection: 'column',
                        textAlign: 'left',
                        borderRadius: '18px',
                        overflow: 'hidden',
                        // Dynamic primary color for selected border
                        border: isSelected ? `2px solid ${theme?.primary_color || 'var(--color-primary)'}` : '1px solid #e2e8f0',
                        // Dynamic faint background for selected card
                        background: isSelected ? `${theme?.primary_color || '#3b82f6'}15` : 'white',
                        cursor: 'pointer',
                        minHeight: '148px',
                        boxShadow: isSelected ? `0 12px 24px ${theme?.primary_color || '#3b82f6'}20` : '0 6px 16px rgba(15,23,42,0.04)',
                        minWidth: '240px'
                      }}
                    >
                      <div style={{ minHeight: '90px', background: m.image ? `url(${m.image}) center/cover no-repeat` : '#f8fafc', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {!m.image && (
                          <div style={{ textAlign: 'center', color: '#94a3b8', padding: '0.75rem' }}>
                            <Map size={20} />
                            <div style={{ fontSize: '0.75rem', marginTop: '0.35rem' }}>No preview</div>
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a' }}>{m.name}</span>
                        <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{m.zones.length} locations</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {activeMap && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              {/* Map Bounds */}
              <div style={{ width: '100%', background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', position: 'relative' }}>
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
              <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', padding: '1.25rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                 <h3 style={{ fontSize: '0.875rem', fontWeight: 800, color: '#0f172a', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Key Locations</h3>
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