import React, { useEffect, useRef, useState } from 'react';
import ePub from 'epubjs';

export function EPUBReader({ file, isDarkMode, isFullscreen, navCommand }) {
  const viewerRef = useRef(null);
  const bookRef = useRef(null);
  const renditionRef = useRef(null);
  const currentCfiRef = useRef(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [navInput, setNavInput] = useState("");

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
              
              const viewportHeight = contents.window.innerHeight;
              const targetTop = viewportHeight * 0.20; // 20% of screen height
              const offset = rect.bottom - targetTop;
              
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
          setCurrentPage(book.locations.locationFromCfi(currentLocation.start.cfi));
          setTotalPages(book.locations.total);
        }
      }).catch(console.error);

      rendition.on('relocated', (location) => {
        currentCfiRef.current = location.start.cfi;
        if (book.locations.length > 0) {
          setCurrentPage(book.locations.locationFromCfi(location.start.cfi));
          setTotalPages(book.locations.total);
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

  const handleLocalNav = (val) => {
    if (bookRef.current && renditionRef.current && val >= 1 && val <= totalPages) {
       const cfi = bookRef.current.locations.cfiFromLocation(val);
       if (cfi) {
         renditionRef.current.display(cfi);
       }
    }
  };

  useEffect(() => {
    if (navCommand && bookRef.current && renditionRef.current) {
      handleLocalNav(navCommand.page);
    }
  }, [navCommand]);

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
      {totalPages > 0 && (
        <div 
          onDoubleClick={() => {
            setNavInput(String(currentPage > 0 ? currentPage : 1));
            setIsEditingPage(true);
          }}
          className="fixed bottom-6 right-8 text-foreground/40 font-bold text-xs md:text-sm z-50 tabular-nums select-none group"
        >
          {isEditingPage ? (
            <form onSubmit={(e) => {
              e.preventDefault();
              handleLocalNav(parseInt(navInput));
              setIsEditingPage(false);
            }}>
              <input
                autoFocus
                type="number"
                min="1"
                max={totalPages}
                value={navInput}
                onChange={e => setNavInput(e.target.value)}
                onBlur={() => setIsEditingPage(false)}
                className="w-14 bg-background border border-foreground/20 rounded px-1 py-0.5 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
              />
              <span className="ml-1">/ {totalPages}</span>
            </form>
          ) : (
            <div className="cursor-text hover:text-foreground/60 transition-colors" title="Double-click to manually enter page number">
              {currentPage > 0 ? currentPage : '-'} / {totalPages}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
