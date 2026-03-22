import React from 'react';
import { Moon, Sun, Maximize2, Minimize2, FolderOpen, Hash } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function Header({ 
  onFileSelect, 
  isDarkMode, 
  toggleDarkMode, 
  isFullscreen, 
  toggleFullscreen,
  hasFile,
  onNavigateClick
}) {
  return (
    <>
      <div className="header-trigger h-4 fixed top-0 left-0 right-0 z-50" />
      <header className={cn(
        "header-container fixed top-0 left-0 right-0 p-6 flex items-center justify-between z-40 pointer-events-none transition-transform duration-300",
      )}>
        <div className="flex items-center gap-4 pointer-events-auto">
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-baseline">
            A<span style={{ fontVariant: 'small-caps' }}>mo</span><span className="text-blue-600" style={{ fontVariant: 'small-caps' }}>s</span>
          </h1>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <label className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-full cursor-pointer transition-all shadow-lg shadow-blue-600/20 active:scale-95">
            <FolderOpen size={16} />
            <span className="font-medium">Open Book</span>
            <input 
              type="file" 
              accept=".pdf,.epub" 
              className="hidden" 
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onFileSelect(file);
              }}
            />
          </label>

          {hasFile && (
            <button
              onClick={onNavigateClick}
              className="p-1.5 hover:bg-foreground/5 rounded-full text-foreground transition-colors"
              title="Go to Page (N)"
            >
              <Hash size={18} />
            </button>
          )}

          <button
            onClick={toggleDarkMode}
            className="p-1.5 hover:bg-foreground/5 rounded-full text-foreground transition-colors"
            title="Toggle Dark Mode (D)"
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 hover:bg-foreground/5 rounded-full text-foreground transition-colors"
            title="Toggle Fullscreen (F)"
          >
            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
          </button>
        </div>
      </header>
    </>
  );
}
