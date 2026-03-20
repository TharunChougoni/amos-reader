import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Reader } from './components/Reader';
import { clsx } from 'clsx';

function App() {
  const [file, setFile] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('darkMode') === 'true';
  });
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    if (file) {
      document.title = `${file.name.replace(/\.[^/.]+$/, "")} - AMOS`;
    } else {
      document.title = 'AMOS';
    }
  }, [file]);

  useEffect(() => {
    localStorage.setItem('darkMode', isDarkMode);
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't trigger if user is typing in an input (though we don't have many)
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

      if (e.key.toLowerCase() === 'f') {
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'd') {
        setIsDarkMode(prev => !prev);
      }
    };

    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    window.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <div className={clsx(
      "h-screen w-screen overflow-hidden bg-background transition-colors duration-300",
      isFullscreen && "is-fullscreen"
    )}>
      <Header 
        onFileSelect={setFile}
        isDarkMode={isDarkMode}
        toggleDarkMode={() => setIsDarkMode(!isDarkMode)}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreen}
      />
      <main className="h-full w-full">
        <Reader file={file} isDarkMode={isDarkMode} isFullscreen={isFullscreen} />
      </main>
    </div>
  );
}

export default App;
