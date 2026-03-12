import React, { useState, useRef, useEffect } from "react";
import { Rnd } from "react-rnd";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import "./App.css";
import JSZip from "jszip";

// --- Types ---
interface Block {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: {
    type: "icon" | "text" | "image" | "table";
    data: any;
  };
}
//  {/*---Changes---*/}

interface Guide {
  type: 'vertical' | 'horizontal';
  pos: number;
}
//  {/*---Changes---*/}

const GRID_SIZE = 20;

function App() {
  // --- Core State ---
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // --- Undo / Redo State ---
  const [past, setPast] = useState<Block[][]>([]);
  const [future, setFuture] = useState<Block[][]>([]);

  // --- UI & Selection State ---
  const [showModal, setShowModal] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [selectionPreview, setSelectionPreview] = useState<Block | null>(null);
  const [isMoving, setIsMoving] = useState(false);

  // --- Snap Logic Engine ---
  const snap = (value: number) => Math.round(value / GRID_SIZE) * GRID_SIZE;
  //  {/*---Changes---*/}
  const SNAP_THRESHOLD = 8; // Pixels proximity to trigger alignment
  const [activeGuides, setActiveGuides] = useState<Guide[]>([]);
  //  {/*---Changes---*/}

  // --- MySQL State ---
  const [dbList, setDbList] = useState<string[]>([]);
  const [tableList, setTableList] = useState<string[]>([]);
  const [columnList, setColumnList] = useState<string[]>([]);
  const [selection, setSelection] = useState({
    db: "",
    table: "",
    columns: [] as string[],
    rows: 5
  });

  // --- History Logic ---
  const recordChange = () => {
    // Snapshot the current blocks into the past before they change
    setPast((prev) => [...prev, [...blocks]]);
    // When a new action is performed, the "future" (redo) is cleared
    setFuture([]);
  };

  const undo = () => {
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);

    setFuture([blocks, ...future]);
    setPast(newPast);
    setBlocks(previous);
  };

  const redo = () => {
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);

    setPast([...past, blocks]);
    setFuture(newFuture);
    setBlocks(next);
  };

  // --- Keyboard Shortcuts (Updated) ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isInput = e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement;
      if (isInput) return; // Don't trigger shortcuts if user is typing in a prompt/input

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? redo() : undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        redo();
      }

      // Duplicate (Ctrl + D)
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "d") {
        e.preventDefault(); // Stop browser from opening "Add Bookmark"
        const selected = blocks.find(b => b.id === selectedId);
        if (selected) duplicateBlock(selected);
      }

      // Delete (Delete or Backspace)
      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedId) {
          deleteBlock(selectedId);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [blocks, past, future, selectedId]); // selectedId added to dependencies

  // --- MySQL Fetching ---
  useEffect(() => {
    if (showModal) {
      axios.get("http://localhost:8000/databases")
        .then(res => setDbList(res.data))
        .catch(() => alert("Error fetching databases"));
    }
  }, [showModal]);

  // Fetch Tables when DB changes
  useEffect(() => {
    if (selection.db) {
      axios.get(`http://localhost:8000/tables?db=${selection.db}`)
        .then(res => setTableList(res.data))
        .catch(() => alert("Error fetching tables"));
    }
  }, [selection.db]);

  // Fetch Columns when Table changes
  useEffect(() => {
    if (selection.table) {
      axios.get(`http://localhost:8000/columns?db=${selection.db}&table=${selection.table}`)
        .then(res => setColumnList(res.data))
        .catch(() => alert("Error fetching columns"));
    }
  }, [selection.table, selection.db]);

  // --- Handlers ---
  const handleColumnToggle = (col: string) => {
    setSelection(prev => ({
      ...prev,
      columns: prev.columns.includes(col)
        ? prev.columns.filter(c => c !== col)
        : [...prev.columns, col]
    }));
  };

  //  {/*---Changes---*/}

  const handleSnapping = (id: string, rawX: number, rawY: number, width: number, height: number) => {
    // 1. Default: Snap to Grid
    let newX = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
    let newY = Math.round(rawY / GRID_SIZE) * GRID_SIZE;

    const guides: Guide[] = [];

    // 2. Alignment Snapping (Overwrites Grid Snap if close to another block)
    blocks.forEach((other) => {
      if (other.id === id) return;

      // Vertical Snap Points (X-axis)
      const otherLeft = other.x;
      const otherCenter = other.x + other.width / 2;
      const otherRight = other.x + other.width;

      const dragLeft = rawX;
      const dragCenter = rawX + width / 2;
      const dragRight = rawX + width;

      // Check all combinations (Left-to-Left, Center-to-Center, etc.)
      const vSnapPoints = [
        { drag: dragLeft, other: otherLeft, result: otherLeft },
        { drag: dragLeft, other: otherRight, result: otherRight },
        { drag: dragCenter, other: otherCenter, result: otherCenter - width / 2 },
        { drag: dragRight, other: otherLeft, result: otherLeft - width },
        { drag: dragRight, other: otherRight, result: otherRight - width },
      ];

      vSnapPoints.forEach(point => {
        if (Math.abs(point.drag - point.other) < SNAP_THRESHOLD) {
          newX = point.result;
          guides.push({ type: 'vertical', pos: point.other });
        }
      });

      // Horizontal Snap Points (Y-axis)
      const otherTop = other.y;
      const otherVCenter = other.y + other.height / 2;
      const otherBottom = other.y + other.height;

      const dragTop = rawY;
      const dragVCenter = rawY + height / 2;
      const dragBottom = rawY + height;

      const hSnapPoints = [
        { drag: dragTop, other: otherTop, result: otherTop },
        { drag: dragTop, other: otherBottom, result: otherBottom },
        { drag: dragVCenter, other: otherVCenter, result: otherVCenter - height / 2 },
        { drag: dragBottom, other: otherTop, result: otherTop - height },
        { drag: dragBottom, other: otherBottom, result: otherBottom - height },
      ];

      hSnapPoints.forEach(point => {
        if (Math.abs(point.drag - point.other) < SNAP_THRESHOLD) {
          newY = point.result;
          guides.push({ type: 'horizontal', pos: point.other });
        }
      });
    });

    setActiveGuides(guides);
    return { x: newX, y: newY };
  };

  //  {/*---Changes---*/}

  const fetchTableData = async () => {
    if (!selectedId) return;
    recordChange();
    try {
      const res = await axios.post("http://localhost:8000/generate-table", selection);
      setBlocks(prev => prev.map(b => b.id === selectedId ? { ...b, content: { type: "table", data: res.data } } : b));
      setShowModal(false);
      setSelection({ db: "", table: "", columns: [], rows: 5 });
    } catch (err) {
      alert("Error generating table from MySQL");
    }
  };

  // --- Helper: Get relative coordinates for drawing ---
  const getRelativeCoordinates = (e: React.MouseEvent | MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  // --- Block Actions ---
  const createDefaultBlock = (): void => {
    recordChange();
    const newBlock: Block = {
      id: uuidv4(),
      x: 100, y: 120, width: 220, height: 150,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const deleteBlock = (id: string): void => {
    recordChange();
    setBlocks(blocks.filter((b) => b.id !== id));
    setSelectedId(null);
  };

  const duplicateBlock = (block: Block): void => {
    recordChange();
    const newBlock: Block = { ...block, id: uuidv4(), x: block.x + 20, y: block.y + 20 };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  // --- Content Actions ---
  const addIcon = (id: string): void => {
    recordChange();
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content: { type: "icon", data: "⭐" } } : b)));
  };

  const addText = (id: string): void => {
    const text = prompt("Enter text:");
    if (!text) return;
    recordChange();
    setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content: { type: "text", data: text } } : b)));
  };

  const addImage = (id: string, file: File): void => {
    const reader = new FileReader();
    reader.onload = () => {
      recordChange();
      setBlocks((prev) => prev.map((b) => (b.id === id ? { ...b, content: { type: "image", data: reader.result } } : b)));
    };
    reader.readAsDataURL(file);
  };

  // --- Mouse Events for Click-and-Drag Creation ---
  // --- Drawing Events ---
  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest(".rnd-block") || target.tagName === "BUTTON" || target.tagName === "INPUT" || target.tagName === "SELECT") return;
    const rect = containerRef.current!.getBoundingClientRect();
    setIsSelecting(true);
    // Initial point is snapped
    setStartPoint({
      x: snap(e.clientX - rect.left),
      y: snap(e.clientY - rect.top)
    });
    setSelectedId(null);
  };
  // const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
  //    // Prevent drawing if we click an existing block or specific button/input
  //   const target = e.target as HTMLElement;
  //   if (target.closest(".rnd-block") || target.tagName === "BUTTON" || target.tagName === "INPUT" || target.tagName === "SELECT") return;
  //   const { x, y } = getRelativeCoordinates(e);
  //   setIsSelecting(true);
  //   setStartPoint({ x, y });
  //   setSelectedId(null);
  // };

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

  // const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
  //   if (!isSelecting || !startPoint) return;
  //   const { x, y } = getRelativeCoordinates(e);
  //   setSelectionPreview({
  //     id: "temp",
  //     x: Math.min(startPoint.x, x),
  //     y: Math.min(startPoint.y, y),
  //     width: Math.abs(x - startPoint.x),
  //     height: Math.abs(y - startPoint.y),
  //   });
  // };

  const handleMouseUp = () => {
    if (selectionPreview) {
      recordChange();
      setBlocks([...blocks, { ...selectionPreview, id: uuidv4() }]);
    }
    setIsSelecting(false);
    setSelectionPreview(null);
  };
  // const handleMouseUp = (): void => {
  //   if (selectionPreview && selectionPreview.width > 20 && selectionPreview.height > 20) {
  //     recordChange();
  //     const newBlock: Block = { ...selectionPreview, id: uuidv4() };
  //     setBlocks([...blocks, newBlock]);
  //     setSelectedId(newBlock.id);
  //   }
  //   setIsSelecting(false);
  //   setStartPoint(null);
  //   setSelectionPreview(null);
  // };

  // --- Exports ---
  const exportPageAsHtml = (): void => {
    if (blocks.length === 0) return;
    // 1. Ask for a filename
    const rawFileName = prompt("Enter a name for your file:", "my-design");
    if (rawFileName === null) return;
    const fileName = rawFileName.trim() || "my-design";
    // 2. Calculate the "Offset" to remove the top/left gap
    // We find the smallest X and Y among all blocks
    const minX = Math.min(...blocks.map(b => b.x));
    const minY = Math.min(...blocks.map(b => b.y));

    // 3. Create a clean clone of the canvas
    const canvasClone = containerRef.current!.cloneNode(true) as HTMLElement;
    // 4. Remove UI elements from the clone
    const selectorsToRemove = [
      ".top-controls",
      ".floating-toolbar",
      ".empty-state",
      ".tip-text",
      ".count-badge",
      "button",
      ".empty-block-text",
      ".react-resizable-handle" // Removes the resize dots/handles
    ];
    selectorsToRemove.forEach(s => canvasClone.querySelectorAll(s).forEach(el => el.remove()));

    // 5. Adjust block positions in the clone to "Zero Out" the gap
    // We subtract the minX and minY (plus a small 20px padding)
    const exportedBlocks = canvasClone.querySelectorAll(".rnd-block");
    exportedBlocks.forEach((el, index) => {
      const htmlEl = el as HTMLElement;
      const blockData = blocks[index];
      // Reset position to remove the UI gap
      htmlEl.style.left = `${blockData.x - minX + 20}px`;
      htmlEl.style.top = `${blockData.y - minY + 20}px`;
      // Clean up visual state
      htmlEl.style.border = "1px solid #d5d9e1";
      htmlEl.style.boxShadow = "none";
      htmlEl.style.transform = "none"; // react-rnd sometimes uses transforms
    });

    // 6. Build the Final HTML
    const finalHtml = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{margin:0;padding:0;background:#f6f8fc;font-family:sans-serif}.app-canvas{width:100vw;height:100vh;position:relative}.rnd-block{position:absolute!important;background:white;border-radius:10px;overflow:hidden;display:flex;flex-direction:column}.block-content{flex:1;display:flex;align-items:center;justify-content:center;padding:8px}table{width:100%;border-collapse:collapse;font-size:.85rem}td,th{border:1px solid #d5d9e1;padding:6px;text-align:left}th{background:#f9fafb}img{max-width:100%;height:auto}</style></head><body><div class="app-canvas">${canvasClone.innerHTML}</div></body></html>`;
    // 7. Download
    const blob = new Blob([finalHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${fileName}.html`;
    link.click();
  };

  const exportPageAsZip = async () => {
    if (blocks.length === 0) return;
    const rawFileName = prompt("Project Name:", "my-web-site");
    if (rawFileName === null) return;
    const projectName = rawFileName.trim() || "my-web-site";
    const zip = new JSZip();
    const imgFolder = zip.folder("images");
    const minX = Math.min(...blocks.map(b => b.x));
    const minY = Math.min(...blocks.map(b => b.y));

    const contentHtml = blocks.map(block => {
      if (!block.content) return "";
      const posStyle = `position: absolute; left: ${block.x - minX}px; top: ${block.y - minY}px; width: ${block.width}px; height: ${block.height}px;`;
      switch (block.content.type) {
        case "text": return `<div class="block-text" style="${posStyle}">${block.content.data}</div>`;
        case "icon": return `<div class="block-icon" style="${posStyle}">${block.content.data}</div>`;
        case "image":
          const imgName = `img_${block.id.split('-')[0]}.png`;
          imgFolder?.file(imgName, block.content.data.split(',')[1], { base64: true });
          return `<img src="images/${imgName}" class="block-image" style="${posStyle}">`;
        case "table":
          const headers = Object.keys(block.content.data[0] || {});
          return `<div class="block-table-container" style="${posStyle}"><table><thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>${block.content.data.map((row: any) => `<tr>${Object.values(row).map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
        default: return "";
      }
    }).join('\n');

    zip.file("index.html", `<!DOCTYPE html><html><head><link rel="stylesheet" href="styles.css"></head><body><div class="page-container">${contentHtml}</div></body></html>`);
    zip.file("styles.css", `body{margin:0;padding:40px;font-family:sans-serif;background:#fff}.page-container{position:relative;width:100%;height:100vh}.block-text,.block-icon{display:flex;align-items:center;justify-content:center}.block-icon{font-size:2.5rem}.block-image{object-fit:contain}.block-table-container{overflow:auto;border-radius:8px;border:1px solid #eee}table{width:100%;border-collapse:collapse}td,th{border:1px solid #eee;padding:12px;text-align:left}th{background:#f9fafb}`);
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${projectName}.zip`;
    link.click();
  };

  const selectedBlock = blocks.find((b) => b.id === selectedId);

  return (
    <div
      ref={containerRef} /*className="app-canvas"*/
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
      {/* Top Controls */}
      <div className="top-controls">
        <div className="top-menu-actions">
          <button onClick={undo} disabled={past.length === 0} title="Undo (Ctrl+Z)">↩️</button>
          <button onClick={redo} disabled={future.length === 0} title="Redo (Ctrl+Y)">↪️</button>
          <div style={{ width: 1, background: '#ddd', margin: '0 10px' }} />
          <div style={dividerStyle} />
          <button onClick={createDefaultBlock} className="btn-primary">+ Block</button>
          <span style={{ marginLeft: "auto", fontSize: "12px", color: "#666" }}>
            Grid: {GRID_SIZE}px | {isMoving ? "Snapping Active" : "Precision Mode"}
          </span>
          <button onClick={() => selectedBlock && addText(selectedBlock.id)} disabled={!selectedBlock}>Text</button>
          <button onClick={() => selectedBlock && addIcon(selectedBlock.id)} disabled={!selectedBlock}>Icon</button>
          <button onClick={() => { if (selectedId) setShowModal(true) }} disabled={!selectedBlock}>Table</button>
          <input type="file" id="file-upload" hidden onChange={(e) => selectedBlock && e.target.files && addImage(selectedBlock.id, e.target.files[0])} />
          <button onClick={() => document.getElementById("file-upload")?.click()} disabled={!selectedBlock}>Image</button>
          <button onClick={() => selectedBlock && duplicateBlock(selectedBlock)} disabled={!selectedBlock} title="Duplicate (Ctrl+D)">Duplicate</button>
          <button onClick={() => selectedBlock && deleteBlock(selectedBlock.id)} className="danger" disabled={!selectedBlock} title="Delete (Delete or Backspace)">Delete</button>
          <button onClick={exportPageAsHtml} className="export-btn">Export HTML</button>
          <button onClick={exportPageAsZip} className="export-btn">Export ZIP</button>
        </div>
        <span className="count-badge">{blocks.length} blocks</span>
      </div>

      {/* Render Blocks */}
      {blocks.length === 0 && !selectionPreview && (
        <div className="empty-state">
          <h2>Start designing</h2>
          <p>Drag on the canvas to draw a block.</p>
        </div>
      )}

      {blocks.map((block) => (
        <Rnd
          key={block.id}
          className="rnd-block"
          size={{ width: block.width, height: block.height }}
          position={{ x: block.x, y: block.y }}
          bounds="parent"
          // Figma-style Snapping: 
          dragGrid={[GRID_SIZE, GRID_SIZE]}
          //  {/*---Changes---*/}
          onDrag={(_e, d) => {
            const { x, y } = handleSnapping(block.id, d.x, d.y, block.width, block.height);
            setBlocks(prev => prev.map(b =>
              b.id === block.id ? { ...b, x, y } : b
            ));
          }}
          //  {/*---Changes---*/}
          resizeGrid={[GRID_SIZE, GRID_SIZE]}
          onDragStart={() => setIsMoving(true)}
          onDragStop={(_e, d) => {
            setIsMoving(false);
            setActiveGuides([]);
            if (d.x !== block.x || d.y !== block.y) {
              //  {/*---Changes---*/}
              
              //  {/*---Changes---*/}
              recordChange();
              setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, x: d.x, y: d.y } : b)));
            }
          }}
          onResizeStart={() => setIsMoving(true)}
          onResizeStop={(_e, _dir, ref, _delta, pos) => {
            setIsMoving(false);
            recordChange();
            setBlocks((prev) => prev.map((b) => b.id === block.id ? { ...b, width: snap(parseInt(ref.style.width)), height: snap(parseInt(ref.style.height)), ...pos } : b));
          }}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            setSelectedId(block.id);
          }}
          style={{
            border: selectedId === block.id ? "2px solid #2563eb" : "1px solid #d5d9e1",
            borderRadius: "10px", background: "white", display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: selectedId === block.id ? "0 4px 15px rgba(37, 99, 235, 0.2)" : "none",
            zIndex: selectedId === block.id ? 10 : 1,
          }}
        >


          {/* Content Area */}
          <div className="block-content">

            {!block.content &&
              <span className="empty-block-text">
                Empty Block <br />
                x:{block.x}, y:{block.y}
              </span>}
            {block.content?.type === "text" && <span>{block.content.data}</span>}
            {block.content?.type === "icon" && <span style={{ fontSize: "2rem" }}>{block.content.data}</span>}
            {block.content?.type === "image" && <img src={block.content.data} style={{ maxWidth: "100%", maxHeight: "100%" }} alt="content" />}
            {block.content?.type === "table" && (
              <table border={1} style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                <thead><tr>{Object.keys(block.content.data[0] || {}).map((k) => <th key={k}>{k}</th>)}</tr></thead>
                <tbody>{block.content.data.map((row: any, i: number) => <tr key={i}>{Object.values(row).map((val: any, j) => <td key={j}>{String(val)}</td>)}</tr>)}</tbody>
              </table>
            )}
          </div>
        </Rnd>
        // <Rnd
        //   key={block.id}
        //   className="rnd-block"
        //   size={{ width: block.width, height: block.height }}
        //   position={{ x: block.x, y: block.y }}
        //   bounds="parent"
        //   onDragStop={(_e, d) => {
        //     if (d.x !== block.x || d.y !== block.y) {
        //       recordChange();
        //       setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, x: d.x, y: d.y } : b)));
        //     }
        //   }}
        //   onResizeStop={(_e, _dir, ref, _delta, pos) => {
        //     recordChange();
        //     setBlocks((prev) => prev.map((b) => b.id === block.id ? { ...b, width: parseInt(ref.style.width, 10), height: parseInt(ref.style.height, 10), ...pos } : b));
        //   }}
        //   onClick={(e: React.MouseEvent) => {
        //     e.stopPropagation();
        //     setSelectedId(block.id);
        //   }}
        //   style={{
        //     border: selectedId === block.id ? "2px solid #2563eb" : "1px solid #d5d9e1",
        //     borderRadius: "10px", background: "white", display: "flex", flexDirection: "column",
        //     boxShadow: selectedId === block.id ? "0 12px 30px rgba(37, 99, 235, 0.18)" : "0 10px 24px rgba(0, 0, 0, 0.08)",
        //     zIndex: selectedId === block.id ? 5 : 1,
        //   }}
        // >
        //   {/* Content Area */}
        //   <div className="block-content">
        //     {!block.content && <span className="empty-block-text">Empty</span>}
        //     {block.content?.type === "text" && <span>{block.content.data}</span>}
        //     {block.content?.type === "icon" && <span style={{ fontSize: "2rem" }}>{block.content.data}</span>}
        //     {block.content?.type === "image" && <img src={block.content.data} style={{ maxWidth: "100%", maxHeight: "100%" }} alt="content" />}
        //     {block.content?.type === "table" && (
        //       <table border={1} style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
        //         <thead><tr>{Object.keys(block.content.data[0] || {}).map((k) => <th key={k}>{k}</th>)}</tr></thead>
        //         <tbody>{block.content.data.map((row: any, i: number) => <tr key={i}>{Object.values(row).map((val: any, j) => <td key={j}>{String(val)}</td>)}</tr>)}</tbody>
        //       </table>
        //     )}
        //   </div>
        // </Rnd>
      ))}

      {/* Selection Preview (Drawing) with Snap-to-Grid Visual */}
      {selectionPreview && (
        <div style={{
          position: "absolute", border: "2px dashed #2563eb", backgroundColor: "rgba(37, 99, 235, 0.1)",
          left: selectionPreview.x, top: selectionPreview.y,
          width: selectionPreview.width, height: selectionPreview.height,
          pointerEvents: "none"
        }} />
      )}
      {/* ---Changes--- */}
      {/* Alignment Guide Lines */}
      {activeGuides.map((guide, index) => (
        <div
          key={index}
          style={{
            position: 'absolute',
            backgroundColor: '#ff0000', // Magenta/Pink figma style
            zIndex: 100,
            pointerEvents: 'none',
            ...(guide.type === 'vertical'
              ? { left: guide.pos, top: 0, bottom: 0, width: '1.5px' }
              : { top: guide.pos, left: 0, right: 0, height: '1.5px' }
            )
          }}
        />
      ))}
 {/*---Changes---*/}
      {/* --- MySQL Table Selector Modal --- */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3>MySQL Data Selector</h3>
            <div className="dropdown-group" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <label>Database</label>
              <select value={selection.db} onChange={e => setSelection({ ...selection, db: e.target.value, table: '', columns: [] })}>
                <option value="">-- Choose DB --</option>
                {dbList.map(db => <option key={db} value={db}>{db}</option>)}
              </select>
              <label>Table</label>
              <select value={selection.table} disabled={!selection.db} onChange={e => setSelection({ ...selection, table: e.target.value, columns: [] })}>
                <option value="">-- Choose Table --</option>
                {tableList.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
              <label>Columns</label>
              <div style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid #eee', padding: '5px' }}>
                {columnList.map(col => (
                  <div key={col}><input type="checkbox" checked={selection.columns.includes(col)} onChange={() => handleColumnToggle(col)} /> {col}</div>
                ))}
              </div>
            </div>
            <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button onClick={fetchTableData} className="btn-primary" disabled={selection.columns.length === 0}>Fetch Data</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Styles for the Modal Content ---
const modalOverlayStyle: React.CSSProperties = { position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 };
const modalContentStyle: React.CSSProperties = { background: "white", padding: "24px", borderRadius: "12px", width: "350px", boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" };
const dividerStyle: React.CSSProperties = { width: 1, height: 20, background: "#eee", margin: "0 5px" };

export default App;