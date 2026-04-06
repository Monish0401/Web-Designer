import React from 'react';
import { Edit2, Copy, Trash2, Palette } from 'lucide-react';

interface FloatingToolbarProps {
  position: { x: number; y: number };
  onEdit: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onStyle: () => void;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  position,
  onEdit,
  onDuplicate,
  onDelete,
  onStyle,
}) => {
  return (
    <div
      className="floating-toolbar"
      onClick = {(e) => e.stopPropagation()}
      style={{
        left: position.x,
        top: position.y - 50,
      }}
    >
      <button onClick={onEdit} title="Edit Block">
        <Edit2 size={16} />
      </button>
      <button onClick={onStyle} title="Style Controls">
        <Palette size={16} />
      </button>
      <button onClick={onDuplicate} title="Duplicate Block">
        <Copy size={16} />
      </button>
      <div className="divider" />
      <button className="danger" onClick={onDelete} title="Delete Block">
        <Trash2 size={16} />
      </button>
    </div>
  );
};
