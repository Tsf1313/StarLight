import React, { createContext, useState, useEffect } from 'react';

const EventContext = createContext(null);

export const EventProvider = ({ children }) => {
  const [selectedEventId, setSelectedEventIdState] = useState(null);
  const [showToGuestsEventId, setShowToGuestsEventIdState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, load event selections from localStorage
  useEffect(() => {
    const storedSelectedEvent = localStorage.getItem('selectedEventId');
    const storedGuestEvent = localStorage.getItem('showToGuestsEventId');
    
    if (storedSelectedEvent) {
      setSelectedEventIdState(storedSelectedEvent);
    }
    if (storedGuestEvent) {
      setShowToGuestsEventIdState(storedGuestEvent);
    }
    
    setIsLoading(false);
  }, []);

  // Update selectedEventId and persist to localStorage
  const setSelectedEventId = (eventId) => {
    setSelectedEventIdState(eventId);
    localStorage.setItem('selectedEventId', eventId);
  };

  // Update showToGuestsEventId and persist to localStorage
  const setShowToGuestsEventId = (eventId) => {
    setShowToGuestsEventIdState(eventId);
    localStorage.setItem('showToGuestsEventId', eventId);
  };

  if (isLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading EventFlow...
      </div>
    );
  }

  return (
    <EventContext.Provider 
      value={{
        selectedEventId,
        setSelectedEventId,
        showToGuestsEventId,
        setShowToGuestsEventId,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEventContext = () => {
  const context = React.useContext(EventContext);
  if (!context) {
    throw new Error('useEventContext must be used within EventProvider');
  }
  return context;
};
