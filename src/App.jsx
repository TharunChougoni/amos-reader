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
  const [showNavModal, setShowNavModal] = useState(false);
  const [navInput, setNavInput] = useState("");
  const [navCommand, setNavCommand] = useState(null);

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
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setIsDarkMode(prev => !prev);
      } else if (e.key.toLowerCase() === 'n' && file) {
        e.preventDefault();
        setShowNavModal(true);
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
        hasFile={!!file}
        onNavigateClick={() => setShowNavModal(true)}
      />
      <main className="h-full w-full">
        <Reader file={file} isDarkMode={isDarkMode} isFullscreen={isFullscreen} navCommand={navCommand} />
      </main>

      {showNavModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const val = parseInt(navInput);
              if (!isNaN(val) && val > 0) {
                setNavCommand({ page: val, timestamp: Date.now() });
              }
              setShowNavModal(false);
              setNavInput("");
            }}
            className="bg-background border border-foreground/10 shadow-2xl rounded-2xl p-6 flex flex-col gap-4 w-full max-w-sm animate-in fade-in zoom-in-95 duration-200"
          >
            <h2 className="text-lg font-bold text-foreground">Go to Page</h2>
            <input 
              autoFocus
              type="number" 
              min="1"
              value={navInput}
              onChange={e => setNavInput(e.target.value)}
              className="w-full px-4 py-2 bg-foreground/5 border border-foreground/10 rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter page number..."
            />
            <div className="flex justify-end gap-2 mt-2">
              <button 
                type="button" 
                onClick={() => setShowNavModal(false)}
                className="px-4 py-2 hover:bg-foreground/5 rounded-lg text-foreground transition-colors font-medium"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-bold shadow-sm"
              >
                Go
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
