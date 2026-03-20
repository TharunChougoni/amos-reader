import React from 'react';
import { PDFReader } from './PDFReader';
import { EPUBReader } from './EPUBReader';
import { BookOpen } from 'lucide-react';

export function Reader({ file, isDarkMode, isFullscreen }) {
  if (!file) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-foreground/40 gap-4">
        <div className="p-8 rounded-full bg-foreground/5 animate-pulse">
          <BookOpen size={64} />
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-foreground/60">No Book Open</h2>
          <p>Select a PDF or EPUB file to start reading</p>
        </div>
      </div>
    );
  }

  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'pdf') {
    return <PDFReader file={file} isFullscreen={isFullscreen} />;
  }

  if (extension === 'epub') {
    return <EPUBReader file={file} isDarkMode={isDarkMode} isFullscreen={isFullscreen} />;
  }

  return (
    <div className="flex items-center justify-center h-full text-red-500">
      Unsupported file format: .{extension}
    </div>
  );
}
