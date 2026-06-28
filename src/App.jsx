import React, { useState, useEffect } from 'react';
import Header from './components/Header'; 
import Dashboard from './components/Dashboard';
import Admin from './components/Admin'; // 1. Import your brand new Admin file here

function App() {
  const [isAdminMode, setIsAdminMode] = useState(false);

  useEffect(() => {
    const handleSecretShortcut = (e) => {
      // 🔐 Trigger Combo: Hold Ctrl + Shift + A together
      if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        setIsAdminMode((prev) => !prev); // Toggles your layout view silently
      }
    };

    window.addEventListener('keydown', handleSecretShortcut);
    return () => window.removeEventListener('keydown', handleSecretShortcut);
  }, []);

  return (
    <>
      {/* 2. Swaps between user interface and admin panel in-place seamlessly */}
      {!isAdminMode ? (
        <>
          <Header />
          <Dashboard />
        </>
      ) : (
        <Admin />
      )}
    </>
  );
}

export default App;