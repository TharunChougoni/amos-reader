import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PDFReader({ file, isFullscreen, navCommand }) {
  const [numPages, setNumPages] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [aspectRatio, setAspectRatio] = useState(1.414);
  const [pageWidth, setPageWidth] = useState(850);
  const [isEditingPage, setIsEditingPage] = useState(false);
  const [navInput, setNavInput] = useState("");
  const containerRef = useRef(null);

  useEffect(() => {
    const updateWidth = () => {
      setPageWidth(isFullscreen ? window.innerWidth : Math.min(window.innerWidth * 0.9, 850));
    };
    window.addEventListener('resize', updateWidth);
    updateWidth();
    return () => window.removeEventListener('resize', updateWidth);
  }, [isFullscreen]);

  const approxPageHeight = pageWidth * aspectRatio;

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setCurrentPage(1);
  }

  const onPageLoadSuccess = (page) => {
    if (page.originalWidth && page.originalHeight) {
       setAspectRatio(page.originalHeight / page.originalWidth);
    }
  };

  const handleScroll = () => {
    if (!containerRef.current || !numPages) return;
    const { clientHeight } = containerRef.current;
    
    const pageContainers = containerRef.current.querySelectorAll('.page-placeholder');
    let current = currentPage;
    for (let i = 0; i < pageContainers.length; i++) {
       const rect = pageContainers[i].getBoundingClientRect();
       // Check if this container is overlapping the middle of the viewport
       if (rect.top <= clientHeight / 2 && rect.bottom >= clientHeight / 2) {
          current = i + 1;
          break;
       }
    }
    setCurrentPage(prev => (prev !== current ? current : prev));
  };

  useEffect(() => {
    if (containerRef.current && numPages) {
      setTimeout(() => {
        const el = containerRef.current.querySelector(`#page-container-${currentPage}`);
        if (el) {
          containerRef.current.scrollTo({ top: el.offsetTop - 40, behavior: 'instant' });
        }
      }, 150);
    }
  }, [isFullscreen]);

  const handleLocalNav = (val) => {
    if (val >= 1 && val <= numPages) {
      setCurrentPage(val);
      const checkExist = setInterval(() => {
        if (!containerRef.current) {
          clearInterval(checkExist);
          return;
        }
        const el = containerRef.current.querySelector(`#page-container-${val}`);
        if (el) {
          clearInterval(checkExist);
          containerRef.current.scrollTo({ top: el.offsetTop - 40, behavior: 'instant' });
        }
      }, 50);
      setTimeout(() => clearInterval(checkExist), 2000);
    }
  };

  useEffect(() => {
    if (navCommand && numPages && containerRef.current) {
      handleLocalNav(navCommand.page);
    }
  }, [navCommand]);

  const handleMouseUp = () => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (selection && selection.toString().trim().length > 0 && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        if (rect.width === 0 && rect.height === 0) return;
        
        const container = containerRef.current;
        if (!container) return;
        
        const containerRect = container.getBoundingClientRect();
        
        const relativeBottom = rect.bottom - containerRect.top; 
        const targetTop = container.clientHeight * 0.20; // 20% of screen height
        const offset = relativeBottom - targetTop;
        
        if (Math.abs(offset) > 20) {
          container.scrollBy({ top: offset, behavior: 'smooth' });
        }
      }
    }, 50);
  };

  return (
    <div 
      ref={containerRef}
      onScroll={handleScroll}
      onMouseUp={handleMouseUp}
      className={`pdf-container w-full h-full flex flex-col items-center bg-background transition-colors duration-300 ${isFullscreen ? 'py-0 overflow-y-auto' : 'py-20 gap-8 overflow-y-auto'}`}
    >
      <Document
        file={file}
        onLoadSuccess={onDocumentLoadSuccess}
        className={`flex flex-col items-center flex-1 w-full ${isFullscreen ? 'gap-2' : 'gap-8'}`}
        loading={
          <div className="flex items-center justify-center h-[80vh] text-foreground">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        {Array.from(new Array(numPages || 0), (_, index) => {
          const pageNumber = index + 1;
          const isVisible = Math.abs(pageNumber - currentPage) <= 2;
          
          return (
            <div 
              key={`page_${pageNumber}`} 
              id={`page-container-${pageNumber}`}
              className="page-placeholder w-full flex justify-center"
              style={{ minHeight: `${approxPageHeight}px` }}
            >
              {isVisible ? (
                <Page 
                  pageNumber={pageNumber} 
                  renderAnnotationLayer={false}
                  onLoadSuccess={pageNumber === 1 ? onPageLoadSuccess : undefined}
                  className={isFullscreen ? 'mb-4' : 'shadow-2xl'}
                  width={pageWidth}
                />
              ) : null}
            </div>
          );
        })}
      </Document>
      
      {numPages && (
        <div 
          onDoubleClick={() => {
            setNavInput(String(currentPage));
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
                max={numPages}
                value={navInput}
                onChange={e => setNavInput(e.target.value)}
                onBlur={() => setIsEditingPage(false)}
                className="w-14 bg-background border border-foreground/20 rounded px-1 py-0.5 text-foreground focus:outline-none focus:ring-1 focus:ring-blue-500 text-center"
              />
              <span className="ml-1">/ {numPages}</span>
            </form>
          ) : (
            <div className="cursor-text hover:text-foreground/60 transition-colors" title="Double-click to manually enter page number">
              {currentPage} / {numPages}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
