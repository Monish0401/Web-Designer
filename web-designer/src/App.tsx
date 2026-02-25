import React, { useState, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

interface Block {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content?: {
    type: "icon" | "text";
    data: any;
  };
}

function App() {
  const containerRef =  useRef<HTMLDivElement>(null);

  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const [isSelecting, setIsSelecting] = useState(false);
  const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
  const [selection, setSelection] = useState<Block | null>(null);

  const getRelativeCoordinates = (e: React.MouseEvent) => {
    const rect = containerRef.current!.getBoundingClientRect();

    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    const { x,y } = getRelativeCoordinates(e);
    setIsSelecting(true);
    setStartPoint({ x, y });
    setSelection(null);
    setSelectedBlockId(null);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isSelecting || !startPoint) return;

    const { x, y } = getRelativeCoordinates(e);
  

    setSelection({
      id: "temp",
      x: Math.min(startPoint.x, x),
      y: Math.min(startPoint.y, y),
      width: Math.abs(x - startPoint.x),
      height: Math.abs(y - startPoint.y),
    });
  };

  const handleMouseUp = () => {
    if (selection && selection.width > 20 && selection.height > 20) {
      setBlocks([...blocks, { ...selection, id: uuidv4()}]);
    }
    setIsSelecting(false);
    setSelection(null);
  };

  const addIconToBlock = (id: string) => {
    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id
          ? { ...block, content: { type: "icon", data: "⭐" } }
          : block
      )
    );
  };

  const addTextToBlock = (id: string) => {
    const text = prompt("Enter text:");
    if (!text) return;

    setBlocks((prev) =>
      prev.map((block) =>
        block.id === id
          ? { ...block, content: { type: "text", data: text } }
          : block
      )
    );
  };

  const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100vw",
        height: "100vh",
        backgroundColor: "#f5f5f5",
        position: "relative",
        userSelect: "none",
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      {/* Existing Blocks */}
      {blocks.map((block) => (
        <div
          key={block.id}
          data-type="block"
          onClick={(e) => {
            e.stopPropagation();
            setSelectedBlockId(block.id);
          }}
          style={{
            position: "absolute",
            left: block.x,
            top: block.y,
            width: block.width,
            height: block.height,
            border:
              block.id === selectedBlockId
                ? "2px solid red"
                : "2px dashed blue",
            backgroundColor: "rgba(0,0,255,0.05)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            resize: "both",
            overflow: "auto",
          }}
        >
          {block.content?.type === "icon" && (
            <span style={{ fontSize: "40px" }}>{block.content.data}</span>
          )}

          {block.content?.type === "text" && (
            <span>{block.content.data}</span>
          )}
        </div>
      ))}

      {/* Temporary Selection */}
      {selection && (
        <div
          style={{
            position: "absolute",
            border: "2px dashed black",
            left: selection.x,
            top: selection.y,
            width: selection.width,
            height: selection.height,
            pointerEvents: "none",
          }}
        />
      )}

      {/* Floating Toolbar */}
      {selectedBlock && (
        <div
          style={{
            position: "absolute",
            top: selectedBlock.y - 40,
            left: selectedBlock.x,
            backgroundColor: "white",
            padding: "5px 10px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
            display: "flex",
            gap: "10px",
          }}
        >
          <button onClick={() => addIconToBlock(selectedBlock.id)}>
            Add Icon
          </button>
          <button onClick={() => addTextToBlock(selectedBlock.id)}>
            Add Text
          </button>
        </div>
      )}
    </div>
  );
}

export default App;


