import React, { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';

export function EPUBReader({ file, isDarkMode, isFullscreen }) {
  const viewerRef = useRef(null);
  const bookRef = useRef(null);
  const renditionRef = useRef(null);
  const currentCfiRef = useRef(null);
  const [progress, setProgress] = useState("");

  useEffect(() => {
    if (!file || !viewerRef.current) return;

    // Use FileReader for local files
    const reader = new FileReader();
    reader.onload = async (e) => {
      const data = e.target.result;
      
      if (bookRef.current) {
        bookRef.current.destroy();
      }

      const book = ePub(data);
      bookRef.current = book;
      
      const rendition = book.renderTo(viewerRef.current, {
        width: '100%',
        height: '100%',
        flow: 'scrolled-doc',
        manager: 'continuous'
      });
      renditionRef.current = rendition;

      rendition.hooks.content.register((contents) => {
        const handleMouseUp = () => {
          setTimeout(() => {
            const selection = contents.window.getSelection();
            if (selection && selection.toString().trim().length > 0 && selection.rangeCount > 0) {
              const range = selection.getRangeAt(0);
              const rect = range.getBoundingClientRect();
              if (rect.width === 0 && rect.height === 0) return;
              
              // Position the bottom of the selection near the top of the viewport
              const offset = rect.bottom - 40; // 40px margin from the top
              
              if (Math.abs(offset) > 20) {
                contents.window.scrollBy({ top: offset, behavior: 'smooth' });
                const wrapper = viewerRef.current?.parentElement;
                if (wrapper && wrapper.scrollHeight > wrapper.clientHeight) {
                  wrapper.scrollBy({ top: offset, behavior: 'smooth' });
                }
              }
            }
          }, 50);
        };
        contents.document.addEventListener('mouseup', handleMouseUp);
      });

      book.ready.then(() => {
        return book.locations.generate(1600);
      }).then(() => {
        const currentLocation = rendition.currentLocation();
        if (currentLocation) {
          currentCfiRef.current = currentLocation.start.cfi;
          const currentPage = book.locations.locationFromCfi(currentLocation.start.cfi);
          const totalPages = book.locations.total;
          setProgress(`${currentPage} / ${totalPages}`);
        }
      }).catch(console.error);

      rendition.on('relocated', (location) => {
        currentCfiRef.current = location.start.cfi;
        if (book.locations.length > 0) {
          const currentPage = book.locations.locationFromCfi(location.start.cfi);
          const totalPages = book.locations.total;
          setProgress(`${currentPage} / ${totalPages}`);
        }
      });

      await rendition.display();
      applyTheme(isDarkMode);
    };
    reader.readAsArrayBuffer(file);

    return () => {
      if (bookRef.current) {
        bookRef.current.destroy();
      }
    };
  }, [file]);

  useEffect(() => {
    if (renditionRef.current && currentCfiRef.current) {
      setTimeout(() => {
        renditionRef.current.display(currentCfiRef.current);
      }, 300); // Wait for transition
    }
  }, [isFullscreen]);

  useEffect(() => {
    applyTheme(isDarkMode);
  }, [isDarkMode]);

  const applyTheme = (dark) => {
    if (!renditionRef.current) return;
    
    const theme = {
      body: {
        background: dark ? '#212121' : '#f8fafc',
        color: dark ? '#e0e0e0' : '#0f172a',
        'font-family': 'Inter, system-ui, -apple-system, sans-serif !important',
        'font-size': '18px !important',
        'line-height': '1.75 !important',
        'padding': '60px 20px !important',
      },
      '::selection': {
        background: dark ? 'rgba(255, 255, 255, 0.25) !important' : 'rgba(0, 0, 0, 0.2) !important',
        color: 'inherit !important',
        'text-shadow': 'none !important',
        '-webkit-text-stroke': '0 !important'
      }
    };

    renditionRef.current.themes.register('custom', theme);
    renditionRef.current.themes.select('custom');
  };

  return (
    <div className="epub-wrapper w-full h-full bg-background transition-colors duration-300 overflow-y-auto relative">
      <div 
        ref={viewerRef} 
        className={`epub-viewer min-h-screen w-full mx-auto transition-all pt-20 ${isFullscreen ? 'max-w-full px-4' : 'max-w-3xl'}`}
      />
      {progress && (
        <div className="fixed bottom-6 right-8 text-foreground/40 font-bold text-xs md:text-sm z-50 pointer-events-none tabular-nums select-none transition-opacity">
          {progress}
        </div>
      )}
    </div>
  );
}
