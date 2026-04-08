import React from 'react';

/**
 * AdBanner Component
 * A generic placeholder for future ad integrations.
 * Use this in feeds, below headers, or standard ad zones.
 */
const AdBanner = ({ height = '120px', className = '' }) => {
  return (
    <div 
      className={`ad-container ${className}`}
      style={{
        width: '100%',
        height: height,
        backgroundColor: '#e2e8f0', // slate-200
        border: '1px dashed #cbd5e1', // slate-300
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '8px',
        margin: '1rem 0',
        overflow: 'hidden'
      }}
    >
      <div style={{
        color: '#64748b', // slate-500
        fontWeight: '600',
        fontSize: '0.875rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
      }}>
        Ad Space Reserved
      </div>
    </div>
  );
};

export default AdBanner;
