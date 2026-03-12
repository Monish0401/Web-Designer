import React, { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { v4 as uuidv4 } from "uuid";
import "./App.css";

// --- Types ---
interface Block {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: {
    type: "text";
    data: any;
  };
}

const GRID_SIZE = 20;

function App() {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [past, setPast] = useState<Block[][]>([]);
  const [future, setFuture] = useState<Block[][]>([]);
  
  // UI State
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [selectionPreview, setSelectionPreview] = useState<Block | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  // --- Snap Logic Engine ---
  const snap = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;

  // History Helper
  const recordChange = () => {
    setPast((prev) => [...prev, [...blocks]]);
    setFuture([]);
  };

  const undo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    setFuture([blocks, ...future]);
    setPast(past.slice(0, -1));
    setBlocks(previous);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    setPast([...past, blocks]);
    setFuture(future.slice(1));
    setBlocks(next);
  };

  // --- Handlers ---
  const deleteBlock = (id: string) => {
    recordChange();
    setBlocks(blocks.filter((b) => b.id !== id));
    setSelectedId(null);
  };

  const duplicateBlock = (block: Block) => {
    recordChange();
    setBlocks([...blocks, { ...block, id: uuidv4(), x: block.x + GRID_SIZE, y: block.y + GRID_SIZE }]);
  };

  // --- Keyboard Shortcuts ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return;

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault();
        const selected = blocks.find(b => b.id === selectedId);
        if (selected) duplicateBlock(selected);
      } else if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) deleteBlock(selectedId);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [blocks, selectedId, past, future]);

  // --- Drawing with Snapping ---
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".rnd-block") || target.tagName === "BUTTON") return;
    const rect = containerRef.current!.getBoundingClientRect();
    setIsSelecting(true);
    // Initial point is snapped
    setStartPoint({ 
      x: snap(e.clientX - rect.left), 
      y: snap(e.clientY - rect.top) 
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isSelecting || !startPoint) return;
    const rect = containerRef.current!.getBoundingClientRect();
    const curX = snap(e.clientX - rect.left);
    const curY = snap(e.clientY - rect.top);
    
    setSelectionPreview({
      id: "temp",
      x: Math.min(startPoint.x, curX),
      y: Math.min(startPoint.y, curY),
      width: Math.max(GRID_SIZE, Math.abs(curX - startPoint.x)),
      height: Math.max(GRID_SIZE, Math.abs(curY - startPoint.y)),
    });
  };

  const handleMouseUp = () => {
    if (selectionPreview) {
      recordChange();
      setBlocks([...blocks, { ...selectionPreview, id: uuidv4() }]);
    }
    setIsSelecting(false);
    setSelectionPreview(null);
  };

  return (
    <div 
      ref={containerRef} 
      onMouseDown={handleMouseDown} 
      onMouseMove={handleMouseMove} 
      onMouseUp={handleMouseUp}
      style={{ 
        width: "100vw", height: "100vh", position: "relative", overflow: "hidden", 
        background: "#f0f2f5",
        // The dynamic grid background
        backgroundImage: isMoving || isSelecting 
          ? `radial-gradient(#d1d5db 1px, transparent 0)` 
          : "none",
        backgroundSize: `${GRID_SIZE}px ${GRID_SIZE}px`
      }}
    >
      {/* Navbar */}
      <div style={navStyle}>
        <button onClick={undo} disabled={past.length === 0} style={btnStyle}>↩️</button>
        <button onClick={redo} disabled={future.length === 0} style={btnStyle}>↪️</button>
        <div style={dividerStyle} />
        <button onClick={() => { recordChange(); setBlocks([...blocks, { id: uuidv4(), x: 40, y: 80, width: 100, height: 100 }]); }} style={primaryBtnStyle}>+ Add</button>
        <span style={{ marginLeft: "auto", fontSize: "12px", color: "#666" }}>
          Grid: {GRID_SIZE}px | {isMoving ? "Snapping Active" : "Precision Mode"}
        </span>
      </div>

      {blocks.map((block) => (
        <Rnd
          key={block.id}
          size={{ width: block.width, height: block.height }}
          position={{ x: block.x, y: block.y }}
          // Figma-style Snapping: 
          dragGrid={[GRID_SIZE, GRID_SIZE]}
          resizeGrid={[GRID_SIZE, GRID_SIZE]}
          onDragStart={() => setIsMoving(true)}
          onDragStop={(_e, d) => {
            setIsMoving(false);
            if (d.x !== block.x || d.y !== block.y) {
              recordChange();
              setBlocks(prev => prev.map(b => b.id === block.id ? { ...b, x: d.x, y: d.y } : b));
            }
          }}
          onResizeStart={() => setIsMoving(true)}
          onResizeStop={(_e, _dir, ref, _delta, pos) => {
            setIsMoving(false);
            recordChange();
            setBlocks(prev => prev.map(b => b.id === block.id ? { 
              ...b, 
              width: snap(parseInt(ref.style.width)), 
              height: snap(parseInt(ref.style.height)), 
              ...pos 
            } : b));
          }}
          onClick={(e: React.MouseEvent) => { e.stopPropagation(); setSelectedId(block.id); }}
          style={{
            border: selectedId === block.id ? "2px solid #2563eb" : "1px solid #ccc",
            background: "white", borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: selectedId === block.id ? "0 4px 15px rgba(37, 99, 235, 0.2)" : "none",
            zIndex: selectedId === block.id ? 10 : 1
          }}
        >
          <div style={{ fontSize: '10px', color: '#ccc', userSelect: 'none' }}>
            {block.x}, {block.y}
          </div>
        </Rnd>
      ))}

      {/* Preview with Snap-to-Grid Visual */}
      {selectionPreview && (
        <div style={{ 
          position: "absolute", border: "2px solid #2563eb", background: "rgba(37, 99, 235, 0.05)", 
          left: selectionPreview.x, top: selectionPreview.y, 
          width: selectionPreview.width, height: selectionPreview.height, 
          pointerEvents: "none" 
        }} />
      )}
    </div>
  );
}

// --- Styles ---
const navStyle: React.CSSProperties = {
  position: "absolute", top: 0, left: 0, right: 0, height: "50px", background: "white",
  display: "flex", alignItems: "center", padding: "0 20px", borderBottom: "1px solid #ddd", zIndex: 100, gap: "8px"
};

const btnStyle: React.CSSProperties = { padding: "4px 10px", border: "1px solid #ddd", borderRadius: "4px", background: "white", cursor: "pointer" };
const primaryBtnStyle: React.CSSProperties = { ...btnStyle, background: "#2563eb", color: "white", border: "none" };
const dividerStyle: React.CSSProperties = { width: 1, height: 20, background: "#eee", margin: "0 5px" };

export default App;
