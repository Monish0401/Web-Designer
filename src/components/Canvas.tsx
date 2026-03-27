import React, { useState, useRef, useEffect } from 'react';
import { Block as BlockType } from '../types/index';
import { Block } from './Block';
import { FloatingToolbar } from './FloatingToolbar';
import { TopControls } from './TopControls';
import { AddBlockModal } from './modals/AddBlockModal';
import { BlockTypeSelector } from './modals/BlockTypeSelector';
import { StylePanel } from './StylePanel';
import { downloadHTML, downloadZIP } from '../utils/exportUtils';
import { toast } from 'sonner';

export const Canvas: React.FC = () => {
    const [blocks, setBlocks] = useState<BlockType[]>([]);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [draggedBlockId, setDraggedBlockId] = useState<string | null>(null);
    const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingBlock, setEditingBlock] = useState<BlockType | null>(null);
    const [history, setHistory] = useState<BlockType[][]>([[]]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [resizing, setResizing] = useState<{ blockId: string; handle: string } | null>(null);
    const [resizeStart, setResizeStart] = useState<{ x: number; y: number; width: number; height: number; blockX: number; blockY: number } | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
    const [drawPreview, setDrawPreview] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [isBlockTypeSelectorOpen, setIsBlockTypeSelectorOpen] = useState(false);
    const [pendingBlockCoordinates, setPendingBlockCoordinates] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
    const [isStylePanelOpen, setIsStylePanelOpen] = useState(false);
    const canvasRef = useRef<HTMLDivElement>(null);
    const MIN_BLOCK_WIDTH = 100;
    const MIN_BLOCK_HEIGHT = 80;
    const createBlockId = () =>
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? `block-${crypto.randomUUID()}`
            : `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const selectedBlock = blocks.find((b) => b.id === selectedBlockId);

    const saveToHistory = (newBlocks: BlockType[]) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push(newBlocks);
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const handleAddBlock = (type: string, content: any) => {
        const newBlock: BlockType = {
            // id: `block-${Date.now()}`,
            id: createBlockId(),
            type: type as any,
            x: 100 + blocks.length * 20,
            y: 100 + blocks.length * 20,
            width: 300,
            height: 150,
            content,
        };
        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);
        saveToHistory(newBlocks);
        toast.success('Block added successfully');
    };

    const handleEditBlock = (type: string, content: any) => {
        if (!editingBlock) return;
        const newBlocks = blocks.map((b) =>
            b.id === editingBlock.id ? { ...b, content } : b
        );
        setBlocks(newBlocks);
        saveToHistory(newBlocks);
        setEditingBlock(null);
        toast.success('Block updated successfully');
    };

    const handleDuplicateBlock = () => {
        if (!selectedBlockId) return;
        const blockToDuplicate = blocks.find((b) => b.id === selectedBlockId);
        if (!blockToDuplicate) return;

        const newBlock: BlockType = {
            ...blockToDuplicate,
            // id: `block-${Date.now()}`,
            id: createBlockId(),
            x: blockToDuplicate.x + 20,
            y: blockToDuplicate.y + 20,
        };
        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);
        saveToHistory(newBlocks);
        toast.success('Block duplicated');
    };

    const handleDeleteBlock = () => {
        if (!selectedBlockId) return;
        const newBlocks = blocks.filter((b) => b.id !== selectedBlockId);
        setBlocks(newBlocks);
        saveToHistory(newBlocks);
        setSelectedBlockId(null);
        toast.success('Block deleted');
    };

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all blocks?')) {
            setBlocks([]);
            saveToHistory([]);
            setSelectedBlockId(null);
            toast.success('All blocks cleared');
        }
    };

    const handleUndo = () => {
        if (historyIndex > 0) {
            setHistoryIndex(historyIndex - 1);
            setBlocks(history[historyIndex - 1]);
            toast.success('Undo');
        }
    };

    const handleRedo = () => {
        if (historyIndex < history.length - 1) {
            setHistoryIndex(historyIndex + 1);
            setBlocks(history[historyIndex + 1]);
            toast.success('Redo');
        }
    };

    const handleMouseDown = (e: React.MouseEvent, blockId: string) => {
        const block = blocks.find((b) => b.id === blockId);
        if (!block) return;

        setDraggedBlockId(blockId);
        setSelectedBlockId(blockId);
        setDragOffset({
            x: e.clientX - block.x,
            y: e.clientY - block.y,
        });
    };

    const handleResizeStart = (e: React.MouseEvent, blockId: string, handle: string) => {
        e.stopPropagation();
        const block = blocks.find((b) => b.id === blockId);
        if (!block) return;

        setResizing({ blockId, handle });
        setResizeStart({
            x: e.clientX,
            y: e.clientY,
            width: block.width,
            height: block.height,
            blockX: block.x,
            blockY: block.y,
        });
    };

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (e.target === canvasRef.current) {
            // Start drawing a new block
            const rect = canvasRef.current.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            setIsDrawing(true);
            setDrawStart({ x, y });
            setSelectedBlockId(null);
        }
    };

    const handleMouseMove = (e: MouseEvent) => {
        if (draggedBlockId && !resizing) {
            const newBlocks = blocks.map((b) =>
                b.id === draggedBlockId
                    ? {
                        ...b,
                        x: e.clientX - dragOffset.x,
                        y: e.clientY - dragOffset.y,
                    }
                    : b
            );
            setBlocks(newBlocks);
        } else if (resizing && resizeStart) {
            const block = blocks.find((b) => b.id === resizing.blockId);
            if (!block) return;

            const deltaX = e.clientX - resizeStart.x;
            const deltaY = e.clientY - resizeStart.y;

            let newX = block.x;
            let newY = block.y;
            let newWidth = resizeStart.width;
            let newHeight = resizeStart.height;

            switch (resizing.handle) {
                case 'nw':
                    newX = resizeStart.blockX + deltaX;
                    newY = resizeStart.blockY + deltaY;
                    newWidth = resizeStart.width - deltaX;
                    newHeight = resizeStart.height - deltaY;
                    break;
                case 'ne':
                    newY = resizeStart.blockY + deltaY;
                    newWidth = resizeStart.width + deltaX;
                    newHeight = resizeStart.height - deltaY;
                    break;
                case 'sw':
                    newX = resizeStart.blockX + deltaX;
                    newWidth = resizeStart.width - deltaX;
                    newHeight = resizeStart.height + deltaY;
                    break;
                case 'se':
                    newWidth = resizeStart.width + deltaX;
                    newHeight = resizeStart.height + deltaY;
                    break;
                case 'n':
                    newY = resizeStart.blockY + deltaY;
                    newHeight = resizeStart.height - deltaY;
                    break;
                case 's':
                    newHeight = resizeStart.height + deltaY;
                    break;
                case 'w':
                    newX = resizeStart.blockX + deltaX;
                    newWidth = resizeStart.width - deltaX;
                    break;
                case 'e':
                    newWidth = resizeStart.width + deltaX;
                    break;
            }

            // Minimum size constraints with anchored edges
            if (newWidth < MIN_BLOCK_WIDTH) {
                if (resizing.handle.includes('w')) {
                    newX = resizeStart.blockX + (resizeStart.width - MIN_BLOCK_WIDTH);
                }
                newWidth = MIN_BLOCK_WIDTH;
            }

            if (newHeight < MIN_BLOCK_HEIGHT) {
                if (resizing.handle.includes('n')) {
                    newY = resizeStart.blockY + (resizeStart.height - MIN_BLOCK_HEIGHT);
                }
                newHeight = MIN_BLOCK_HEIGHT;
            }

            const newBlocks = blocks.map((b) =>
                b.id === resizing.blockId
                    ? { ...b, x: newX, y: newY, width: newWidth, height: newHeight }
                    : b
            );
            setBlocks(newBlocks);
        } else if (isDrawing && drawStart && canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const currentX = e.clientX - rect.left;
            const currentY = e.clientY - rect.top;

            const x = Math.min(drawStart.x, currentX);
            const y = Math.min(drawStart.y, currentY);
            const width = Math.abs(currentX - drawStart.x);
            const height = Math.abs(currentY - drawStart.y);

            setDrawPreview({ x, y, width, height });
        }
    };

    const handleMouseUp = () => {
        if (draggedBlockId) {
            saveToHistory(blocks);
            setDraggedBlockId(null);
        } else if (resizing) {
            saveToHistory(blocks);
            setResizing(null);
            setResizeStart(null);
        } else if (isDrawing && drawPreview && drawPreview.width > 50 && drawPreview.height > 50) {
            // Show block type selector for newly drawn block
            setPendingBlockCoordinates(drawPreview);
            setIsBlockTypeSelectorOpen(true);
            setIsDrawing(false);
            setDrawStart(null);
            setDrawPreview(null);
        } else if (isDrawing) {
            setIsDrawing(false);
            setDrawStart(null);
            setDrawPreview(null);
        }
    };

    const handleCanvasClick = () => {
        if (!isDrawing && !draggedBlockId && !resizing) {
            setSelectedBlockId(null);
        }
    };

    const handleExportHTML = () => {
        downloadHTML(blocks);
        toast.success('HTML exported successfully');
    };

    const handleExportZIP = async () => {
        await downloadZIP(blocks);
        toast.success('ZIP exported successfully');
    };

    useEffect(() => {
        if (draggedBlockId || resizing || isDrawing) {
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('mouseup', handleMouseUp);
            return () => {
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('mouseup', handleMouseUp);
            };
        }
    }, [draggedBlockId, resizing, isDrawing, dragOffset, drawStart, drawPreview, blocks, resizeStart]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null;
            const isTypingTarget =
                target?.isContentEditable ||
                target?.tagName === 'INPUT' ||
                target?.tagName === 'TEXTAREA' ||
                target?.tagName === 'SELECT';

            if (isTypingTarget) return;

            // Ctrl/Cmd + Z for undo
            if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
                e.preventDefault();
                handleUndo();
            }
            // Ctrl/Cmd + Shift + Z or Ctrl/Cmd + Y for redo
            if ((e.ctrlKey || e.metaKey) && (e.shiftKey && e.key === 'z' || e.key === 'y')) {
                e.preventDefault();
                handleRedo();
            }
            // Delete key to remove selected block
            if (e.key === 'Delete' && selectedBlockId) {
                e.preventDefault();
                handleDeleteBlock();
            }
            // Ctrl/Cmd + D to duplicate
            if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedBlockId) {
                e.preventDefault();
                handleDuplicateBlock();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedBlockId, historyIndex, history]);

    const handleBlockTypeSelect = (type: string) => {
        if (!pendingBlockCoordinates) return;

        const defaultContent: any = {};
        switch (type) {
            case 'heading':
                defaultContent.heading = 'New Heading';
                break;
            case 'text':
                defaultContent.text = 'New block - double click to edit';
                break;
            case 'button':
                defaultContent.buttonText = 'Click Me';
                defaultContent.buttonTemplate = 'primary';
                break;
            case 'list':
                defaultContent.listItems = ['Item 1', 'Item 2', 'Item 3'];
                defaultContent.listType = 'unordered';
                break;
            case 'table':
                defaultContent.tableData = {
                    headers: ['Column 1', 'Column 2'],
                    rows: [['Data 1', 'Data 2']],
                    template: 'default',
                };
                break;
            case 'image':
                defaultContent.imageUrl = 'https://via.placeholder.com/300x200';
                defaultContent.imageAlt = 'Placeholder image';
                break;
        }

        const newBlock: BlockType = {
            // id: `block-${Date.now()}`,
            id: createBlockId(),
            type: type as any,
            x: pendingBlockCoordinates.x,
            y: pendingBlockCoordinates.y,
            width: pendingBlockCoordinates.width,
            height: pendingBlockCoordinates.height,
            content: defaultContent,
        };

        const newBlocks = [...blocks, newBlock];
        setBlocks(newBlocks);
        saveToHistory(newBlocks);
        setSelectedBlockId(newBlock.id);
        setPendingBlockCoordinates(null);
        setIsBlockTypeSelectorOpen(false);
        setEditingBlock(newBlock);
        setIsModalOpen(true);
        toast.success('Block created - customize details');
    };

    const handleStyleChange = (style: any) => {
        if (!selectedBlockId) return;
        const newBlocks = blocks.map((b) =>
            b.id === selectedBlockId ? { ...b, style } : b
        );
        setBlocks(newBlocks);
        saveToHistory(newBlocks);
    };

    return (
        <>
            <div
                className="app-canvas"
                ref={canvasRef}
                onClick={handleCanvasClick}
                onMouseDown={handleCanvasMouseDown}
            >
                <TopControls
                    blockCount={blocks.length}
                    canUndo={historyIndex > 0}
                    canRedo={historyIndex < history.length - 1}
                    onAddBlock={() => setIsModalOpen(true)}
                    onUndo={handleUndo}
                    onRedo={handleRedo}
                    onClearAll={handleClearAll}
                    onExportHTML={handleExportHTML}
                    onExportZIP={handleExportZIP}
                />

                {blocks.length === 0 && !isDrawing && (
                    <div className="empty-state">
                        <h2>Welcome to Canvasflows Blockcraft</h2>
                        <p>Click "Add Block" or drag on the canvas to draw a new block</p>
                    </div>
                )}

                {isDrawing && !drawPreview && (
                    <div className="draw-mode-hint">
                        Drag to draw a block
                    </div>
                )}

                {drawPreview && (
                    <div
                        className="draw-preview"
                        style={{
                            left: drawPreview.x,
                            top: drawPreview.y,
                            width: drawPreview.width,
                            height: drawPreview.height,
                        }}
                    />
                )}

                {blocks.map((block) => (
                    <Block
                        key={block.id}
                        block={block}
                        isSelected={block.id === selectedBlockId}
                        onMouseDown={handleMouseDown}
                        onClick={setSelectedBlockId}
                        onResizeStart={handleResizeStart}
                    />
                ))}

                {selectedBlock && !resizing && !draggedBlockId && (
                    <FloatingToolbar
                        position={{
                            x: selectedBlock.x + selectedBlock.width / 2 - 75,
                            y: selectedBlock.y,
                        }}
                        onEdit={() => {
                            setEditingBlock(selectedBlock);
                            setIsModalOpen(true);
                        }}
                        onStyle={() => setIsStylePanelOpen(true)}
                        onDuplicate={handleDuplicateBlock}
                        onDelete={handleDeleteBlock}
                    />
                )}

                {selectedBlock && isStylePanelOpen && (
                    <StylePanel
                        block={selectedBlock}
                        position={{
                            x: selectedBlock.x + selectedBlock.width + 20,
                            y: selectedBlock.y,
                        }}
                        onStyleChange={handleStyleChange}
                        onClose={() => setIsStylePanelOpen(false)}
                    />
                )}
            </div>

            <AddBlockModal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setEditingBlock(null);
                }}
                onAdd={editingBlock ? handleEditBlock : handleAddBlock}
                editMode={!!editingBlock}
                initialType={editingBlock?.type}
                initialContent={editingBlock?.content}
            />

            <BlockTypeSelector
                isOpen={isBlockTypeSelectorOpen}
                onClose={() => {
                    setIsBlockTypeSelectorOpen(false);
                    setPendingBlockCoordinates(null);
                }}
                onSelect={handleBlockTypeSelect}
            />
        </>
    );
};
