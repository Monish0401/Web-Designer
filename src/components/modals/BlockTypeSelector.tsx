import React from 'react';
import { Type, Heading, Image, List, Table, MousePointerClick, Map } from 'lucide-react';

interface BlockTypeSelectorProps {
  isOpen: boolean;
  onSelect: (type: string) => void;
  onClose: () => void;
}

export const BlockTypeSelector: React.FC<BlockTypeSelectorProps> = ({
  isOpen,
  onSelect,
  onClose,
}) => {
  if (!isOpen) return null;

  const blockTypes = [
    { type: 'heading', label: 'Heading', icon: Heading, description: 'Add a heading' },
    { type: 'text', label: 'Text', icon: Type, description: 'Add text content' },
    { type: 'image', label: 'Image', icon: Image, description: 'Add an image' },
    { type: 'list', label: 'List', icon: List, description: 'Add a list' },
    { type: 'table', label: 'Table', icon: Table, description: 'Add a table' },
    { type: 'button', label: 'Button', icon: MousePointerClick, description: 'Add a button' },
    { type: 'map', label: 'Map', icon: Map, description: 'Add an interactive map' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="block-type-selector-modal" onClick={(e) => e.stopPropagation()}>
        <h2 className="block-type-title">Select Block Type</h2>
        <div className="block-type-grid">
          {blockTypes.map(({ type, label, icon: Icon, description }) => (
            <button
              key={type}
              className="block-type-card"
              onClick={() => {
                onSelect(type);
                onClose();
              }}
            >
              <div className="block-type-icon">
                <Icon size={32} />
              </div>
              <div className="block-type-label">{label}</div>
              <div className="block-type-description">{description}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
