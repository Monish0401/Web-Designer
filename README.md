# Web-Designer
Commands used till now 
1.npx create-react-app web-designer --template typescript
2.npm install react-rnd axios uuid react-moveable jszip
3.npm start

# Web Designer

Web Designer is a React + TypeScript visual editor for building simple webpage layouts using draggable, resizable content blocks.

## Features

- Drag-and-drop style canvas editing.
- Draw-to-create block workflow.
- Block types:
  - Heading
  - Text
  - Image
  - List
  - Table
  - Button
- Block styling controls (colors, typography, alignment, border radius, padding).
- Undo / Redo history.
- Block duplicate and delete actions.
- HTML export.
- ZIP export with:
  - `index.html`
  - `styles.css`
  - `script.js`
  - packaged `assets/` for downloadable images
  - generated export `README.md`

## Tech Stack

- React 18
- TypeScript
- Sonner (toasts)
- Axios (backend API calls for table data)
- JSZip (ZIP generation)
- Lucide icons

## Project Structure

```text
src/
  components/
    Canvas.tsx               # Main editor state + interactions
    Block.tsx                # Block rendering and resize handles
    FloatingToolbar.tsx      # Selected block actions
    TopControls.tsx          # App-level actions (undo/redo/export)
    StylePanel.tsx           # Block style controls
    modals/
      AddBlockModal.tsx      # Add/edit content modal
      BlockTypeSelector.tsx  # Type picker for draw-created blocks
  utils/
    exportUtils.ts           # HTML/ZIP export logic
  styles/
    canvas.css               # Main canvas styling
```

## Getting Started

### 1) Install dependencies

```bash
npm install
```

### 2) Run development server

```bash
npm start
```

### 3) Build for production

```bash
npm run build
```

## Environment Variables

Optional backend URL used by table generation workflow:

```bash
REACT_APP_API_BASE_URL=http://localhost:8000
```

If not provided, default is `http://localhost:8000`.

## Usage Notes

- Click **Add Block** to create blocks via modal.
- Or drag on empty canvas to draw a block area, then choose its type.
- Use floating toolbar for quick actions (Edit, Style, Duplicate, Delete).
- In **Edit mode**, block type is locked to preserve data consistency.

## Keyboard Shortcuts

- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y`: Redo
- `Delete`: Delete selected block
- `Ctrl/Cmd + D`: Duplicate selected block

## Export Behavior

- **Export HTML**: creates a standalone HTML file.
- **Export ZIP**: creates packaged web output with linked CSS/JS and image assets when downloadable.

## Known Limitations

- Remote image downloads during ZIP export may fail because of network/CORS restrictions; the original image URL is used as fallback.
- Table data fetching requires backend endpoints (`/databases`, `/tables`, `/columns`, `/generate-table`).
