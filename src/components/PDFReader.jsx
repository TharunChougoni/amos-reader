import React, { useState, useRef, useEffect } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Set up worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

export function PDFReader({ file, isFullscreen }) {
  const [numPages, setNumPages] = useState(null);
  const [visiblePages, setVisiblePages] = useState(3);
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setVisiblePages(Math.min(3, numPages));
    setCurrentPage(1);
  }

  const handleScroll = () => {
    if (!containerRef.current || !numPages) return;
    const { scrollTop, clientHeight, scrollHeight } = containerRef.current;
    
    // Update current page
    const pageElements = containerRef.current.querySelectorAll('.react-pdf__Page');
    let current = 1;
    for (let i = 0; i < pageElements.length; i++) {
       const rect = pageElements[i].getBoundingClientRect();
       if (rect.top < clientHeight / 2) {
          current = i + 1;
       } else {
          break;
       }
    }
    setCurrentPage(prev => (prev !== current ? current : prev));

    if (scrollHeight - scrollTop <= clientHeight * 1.5) {
      if (visiblePages < numPages) {
        setVisiblePages(prev => Math.min(prev + 2, numPages));
      }
    }
  };

  useEffect(() => {
    if (containerRef.current && numPages) {
      setTimeout(() => {
        const pageElements = containerRef.current.querySelectorAll('.react-pdf__Page');
        if (pageElements.length > 0 && currentPage >= 1) {
          const targetIndex = currentPage - 1;
          if (targetIndex >= 0 && targetIndex < pageElements.length) {
            const el = pageElements[targetIndex];
            const offsetTop = el.offsetTop;
            containerRef.current.scrollTo({ top: offsetTop - 40, behavior: 'auto' });
          }
        }
      }, 150);
    }
  }, [isFullscreen]);

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
        
        // Position the bottom of the selection near the top of the container
        const relativeBottom = rect.bottom - containerRect.top; 
        const offset = relativeBottom - 40; // 40px margin from the top
        
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
        className={`flex flex-col items-center flex-1 ${isFullscreen ? 'gap-2' : 'gap-8'}`}
        loading={
          <div className="flex items-center justify-center h-[80vh] text-foreground">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        }
      >
        {Array.from(new Array(visiblePages), (el, index) => (
          <Page 
            key={`page_${index + 1}`} 
            pageNumber={index + 1} 
            renderAnnotationLayer={false}
            className={isFullscreen ? 'mb-4' : 'shadow-2xl'}
            width={isFullscreen ? window.innerWidth : Math.min(window.innerWidth * 0.9, 850)}
          />
        ))}
      </Document>
      
      {numPages && (
        <div className="fixed bottom-6 right-8 text-foreground/40 font-bold text-xs md:text-sm z-50 pointer-events-none tabular-nums select-none">
          {currentPage} / {numPages}
        </div>
      )}
    </div>
  );
}
