import React from 'react';
import { Plus, Undo, Redo, Trash2, Download, FileCode } from 'lucide-react';

interface TopControlsProps {
  blockCount: number;
  canUndo: boolean;
  canRedo: boolean;
  onAddBlock: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onClearAll: () => void;
  onExportHTML: () => void;
  onExportZIP: () => void;
}

export const TopControls: React.FC<TopControlsProps> = ({
  blockCount,
  canUndo,
  canRedo,
  onAddBlock,
  onUndo,
  onRedo,
  onClearAll,
  onExportHTML,
  onExportZIP,
}) => {
  return (
    <div className="top-controls">
      <button className="btn-primary" onClick={onAddBlock}>
        <Plus size={18} style={{ marginRight: '6px', display: 'inline-block', verticalAlign: 'middle' }} />
        Add Block
      </button>

      <span className="count-badge">{blockCount} blocks</span>

      <div className="divider" />

      <div className="top-menu-actions">
        <button onClick={onUndo} disabled={!canUndo} title="Undo">
          <Undo size={16} />
        </button>
        <button onClick={onRedo} disabled={!canRedo} title="Redo">
          <Redo size={16} />
        </button>
      </div>

      <div className="divider" />

      <div className="top-menu-actions">
        {/* <button onClick={onExportHTML} title="Export as HTML">
          <FileCode size={16} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
          HTML
        </button> */}
        <button onClick={onExportZIP} title="Export as ZIP">
          <Download size={16} style={{ marginRight: '4px', display: 'inline-block', verticalAlign: 'middle' }} />
          ZIP
        </button>
      </div>

      <div className="divider" />

      <div className="top-menu-actions">
        <button className="danger" onClick={onClearAll} disabled={blockCount === 0} title="Clear All">
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};
