# Amos Reader

A clean browser-based reading app for PDFs and EPUBs. Amos Reader focuses on distraction-free reading, quick file loading, and a dark, minimal interface that works well for long reading sessions.

## Features

- Open local PDF files in the browser
- Read EPUB files with a dedicated EPUB reader view
- Minimal dark interface for comfortable reading
- Responsive layout for desktop and laptop screens
- Reader controls for navigation and document switching
- Built as a lightweight Vite + React app

## Tech Stack

- React
- Vite
- Tailwind CSS
- react-pdf
- epubjs / react-reader
- Lucide React icons

## Run Locally

```bash
npm install
npm run dev
```

Build:

```bash
npm run build
```

If a local `dist/` folder has permission issues from an older build, build to a temporary output folder:

```bash
node node_modules/vite/bin/vite.js build --outDir /tmp/amos-reader-build --emptyOutDir
```

## Project Structure

```text
src/App.jsx                    App shell
src/components/PDFReader.jsx    PDF reading view
src/components/EPUBReader.jsx   EPUB reading view
src/components/Header.jsx       Top navigation/header
src/components/Reader.jsx       Reader routing/container
```

## Status

Personal reading-tool project. Main goal: make PDFs/EPUBs easier to open and read without a heavy desktop app.
