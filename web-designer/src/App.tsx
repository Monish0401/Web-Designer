import React, { useState, useRef } from "react";
import { Rnd } from "react-rnd";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";

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

function App() {
  // State
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [promptText, setPromptText] = useState<string>("");

  // Selection/Drawing State
  const containerRef = useRef<HTMLDivElement>(null);
  const [isSelecting, setIsSelecting] = useState<boolean>(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [selectionPreview, setSelectionPreview] = useState<Block | null>(null);

  // --- Helper: Get relative coordinates for drawing ---
  const getRelativeCoordinates = (e: React.MouseEvent | MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  // --- Block Actions ---
  const createDefaultBlock = (): void => {
    const newBlock: Block = {
      id: uuidv4(),
      x: 100,
      y: 100,
      width: 200,
      height: 150,
    };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  const deleteBlock = (id: string): void => {
    setBlocks(blocks.filter((b) => b.id !== id));
    setSelectedId(null);
  };

  const duplicateBlock = (block: Block): void => {
    const newBlock: Block = { ...block, id: uuidv4(), x: block.x + 20, y: block.y + 20 };
    setBlocks([...blocks, newBlock]);
    setSelectedId(newBlock.id);
  };

  // --- Content Actions ---
  const addIcon = (id: string): void => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content: { type: "icon", data: "⭐" } } : b))
    );
  };

  const addText = (id: string): void => {
    const text = prompt("Enter text:");
    if (!text) return;
    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...b, content: { type: "text", data: text } } : b))
    );
  };

  const addImage = (id: string, file: File): void => {
    const reader = new FileReader();
    reader.onload = () => {
      setBlocks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, content: { type: "image", data: reader.result } } : b))
      );
    };
    reader.readAsDataURL(file);
  };

  const sendTablePrompt = async (): Promise<void> => {
    try {
      const res = await axios.post("http://localhost:8000/generate-table", { prompt: promptText });
      setBlocks((prev) =>
        prev.map((b) => (b.id === selectedId ? { ...b, content: { type: "table", data: res.data } } : b))
      );
      setShowModal(false);
      setPromptText("");
    } catch (err) {
      alert("Backend error generating table");
    }
  };

  // --- Mouse Events for Click-and-Drag Creation ---
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>): void => {
    // Prevent drawing if we click an existing block or specific button/input
    const target = e.target as HTMLElement;
    if (target.closest(".rnd-block") || target.tagName === "BUTTON" || target.tagName === "INPUT") {
      return;
    }
    
    const { x, y } = getRelativeCoordinates(e);
    setIsSelecting(true);
    setStartPoint({ x, y });
    setSelectedId(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>): void => {
    if (!isSelecting || !startPoint) return;
    const { x, y } = getRelativeCoordinates(e);

    setSelectionPreview({
      id: "temp",
      x: Math.min(startPoint.x, x),
      y: Math.min(startPoint.y, y),
      width: Math.abs(x - startPoint.x),
      height: Math.abs(y - startPoint.y),
    });
  };

  const handleMouseUp = (): void => {
    if (selectionPreview && selectionPreview.width > 20 && selectionPreview.height > 20) {
      const newBlock: Block = { ...selectionPreview, id: uuidv4() };
      setBlocks([...blocks, newBlock]);
      setSelectedId(newBlock.id);
    }
    setIsSelecting(false);
    setStartPoint(null);
    setSelectionPreview(null);
  };

  const selectedBlock = blocks.find((b) => b.id === selectedId);

  return (
    <div
      ref={containerRef}
      style={{ width: "100vw", height: "100vh", background: "#f5f5f5", position: "relative", overflow: "hidden" }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Top Controls */}
      <div style={{ position: "absolute", top: 10, left: 10, zIndex: 10 }}>
        <button onClick={createDefaultBlock} style={btnStyle}>+ Add Block Manually</button>
        <span style={{ marginLeft: 10, fontSize: "14px", color: "#666" }}>
          Tip: Click and drag on empty space to draw a block.
        </span>
      </div>

      {/* Render Blocks */}
      {blocks.map((block) => (
        <Rnd
          key={block.id}
          className="rnd-block"
          size={{ width: block.width, height: block.height }}
          position={{ x: block.x, y: block.y }}
          bounds="parent"
          onDragStop={(_e: any, d: { x: number; y: number }) => {
            setBlocks((prev) => prev.map((b) => (b.id === block.id ? { ...b, x: d.x, y: d.y } : b)));
          }}
          onResizeStop={(_e: any, _dir: any, ref: HTMLElement, _delta: any, pos: { x: number; y: number }) => {
            setBlocks((prev) =>
              prev.map((b) =>
                b.id === block.id
                  ? { ...b, width: parseInt(ref.style.width), height: parseInt(ref.style.height), ...pos }
                  : b
              )
            );
          }}
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation();
            setSelectedId(block.id);
          }}
          style={{
            border: selectedId === block.id ? "2px solid #3b82f6" : "1px solid #ccc",
            background: "white",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
            zIndex: selectedId === block.id ? 5 : 1,
          }}
        >
          {/* Content Area */}
          <div style={{ flex: 1, overflow: "auto", padding: "5px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            {!block.content && <span style={{ color: "#999" }}>Empty Block</span>}
            
            {block.content?.type === "text" && <span>{block.content.data}</span>}
            
            {block.content?.type === "icon" && <span style={{ fontSize: "2rem" }}>{block.content.data}</span>}
            
            {block.content?.type === "image" && (
              <img src={block.content.data} style={{ maxWidth: "100%", maxHeight: "100%" }} alt="content" />
            )}

            {block.content?.type === "table" && (
              <table border={1} style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {Object.keys(block.content.data[0] || {}).map((k) => <th key={k}>{k}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {block.content.data.map((row: any, i: number) => (
                    <tr key={i}>
                      {Object.values(row).map((val: any, j) => <td key={j}>{val}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </Rnd>
      ))}

      {/* Selection Preview (Drawing) */}
      {selectionPreview && (
        <div
          style={{
            position: "absolute",
            border: "2px dashed #3b82f6",
            backgroundColor: "rgba(59, 130, 246, 0.1)",
            left: selectionPreview.x,
            top: selectionPreview.y,
            width: selectionPreview.width,
            height: selectionPreview.height,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Floating Toolbar for Selected Block */}
      {selectedBlock && (
        <div
          style={{
            position: "absolute",
            top: selectedBlock.y - 50,
            left: selectedBlock.x,
            backgroundColor: "white",
            padding: "8px",
            borderRadius: "4px",
            boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
            display: "flex",
            gap: "8px",
            zIndex: 100,
          }}
        >
          <button onClick={() => addText(selectedBlock.id)}>Text</button>
          <button onClick={() => addIcon(selectedBlock.id)}>Icon</button>
          <button onClick={() => setShowModal(true)}>Table</button>
          <input
            type="file"
            id="file-upload"
            hidden
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => 
              e.target.files && addImage(selectedBlock.id, e.target.files[0])
            }
          />
          <button onClick={() => document.getElementById("file-upload")?.click()}>Img</button>
          <div style={{ width: "1px", background: "#ddd", margin: "0 4px" }} />
          <button onClick={() => duplicateBlock(selectedBlock)}>Copy</button>
          <button onClick={() => deleteBlock(selectedBlock.id)} style={{ color: "red" }}>Del</button>
        </div>
      )}

      {/* Table Prompt Modal */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3 style={{ marginTop: 0 }}>AI Table Generator</h3>
            <p>Describe the data you want to generate:</p>
            <textarea
              style={{ width: "100%", height: "80px", marginBottom: "10px", padding: "8px" }}
              value={promptText}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPromptText(e.target.value)}
              placeholder="e.g. List of 5 planets and their diameters"
            />
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button onClick={() => setShowModal(false)}>Cancel</button>
              <button 
                onClick={sendTablePrompt} 
                style={{ background: "#3b82f6", color: "white", border: "none", padding: "5px 15px", borderRadius: "4px", cursor: "pointer" }}
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Styles ---
const btnStyle: React.CSSProperties = {
  padding: "8px 16px",
  backgroundColor: "#fff",
  border: "1px solid #ccc",
  borderRadius: "4px",
  cursor: "pointer",
};

const modalOverlayStyle: React.CSSProperties = {
  position: "fixed",
  top: 0, left: 0, width: "100%", height: "100%",
  background: "rgba(0,0,0,0.5)",
  display: "flex", justifyContent: "center", alignItems: "center",
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  background: "white",
  padding: "24px",
  borderRadius: "8px",
  width: "400px",
  boxShadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)",
};

export default App;