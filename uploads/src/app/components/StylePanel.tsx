import React, { useState } from 'react';
import { Block, BlockStyle } from '../types';
import { 
  Type, 
  Bold, 
  Italic, 
  Underline, 
  AlignLeft, 
  AlignCenter, 
  AlignRight,
  Palette,
  X 
} from 'lucide-react';

interface StylePanelProps {
  block: Block;
  onStyleChange: (style: BlockStyle) => void;
  onClose: () => void;
  position: { x: number; y: number };
}

export const StylePanel: React.FC<StylePanelProps> = ({
  block,
  onStyleChange,
  onClose,
  position,
}) => {
  const [style, setStyle] = useState<BlockStyle>(block.style || {});

  const updateStyle = (updates: Partial<BlockStyle>) => {
    const newStyle = { ...style, ...updates };
    setStyle(newStyle);
    onStyleChange(newStyle);
  };

  const toggleBold = () => {
    updateStyle({ 
      fontWeight: style.fontWeight === 'bold' ? 'normal' : 'bold' 
    });
  };

  const toggleItalic = () => {
    updateStyle({ 
      fontStyle: style.fontStyle === 'italic' ? 'normal' : 'italic' 
    });
  };

  const toggleUnderline = () => {
    updateStyle({ 
      textDecoration: style.textDecoration === 'underline' ? 'none' : 'underline' 
    });
  };

  const setAlignment = (align: 'left' | 'center' | 'right') => {
    updateStyle({ textAlign: align });
  };

  const renderTextControls = () => (
    <>
      <div className="style-group">
        <label className="style-label">Font Family</label>
        <select
          className="style-select"
          value={style.fontFamily || 'Inter'}
          onChange={(e) => updateStyle({ fontFamily: e.target.value })}
        >
          <option value="Inter">Inter</option>
          <option value="Arial">Arial</option>
          <option value="Georgia">Georgia</option>
          <option value="Times New Roman">Times New Roman</option>
          <option value="Courier New">Courier New</option>
          <option value="Verdana">Verdana</option>
          <option value="monospace">Monospace</option>
        </select>
      </div>

      <div className="style-group">
        <label className="style-label">Font Size</label>
        <select
          className="style-select"
          value={style.fontSize || '16px'}
          onChange={(e) => updateStyle({ fontSize: e.target.value })}
        >
          <option value="12px">12px</option>
          <option value="14px">14px</option>
          <option value="16px">16px</option>
          <option value="18px">18px</option>
          <option value="20px">20px</option>
          <option value="24px">24px</option>
          <option value="28px">28px</option>
          <option value="32px">32px</option>
          <option value="36px">36px</option>
          <option value="48px">48px</option>
        </select>
      </div>

      <div className="style-group">
        <label className="style-label">Text Style</label>
        <div className="style-button-group">
          <button
            type="button"
            className={`style-icon-btn ${style.fontWeight === 'bold' ? 'active' : ''}`}
            onClick={toggleBold}
            title="Bold"
          >
            <Bold size={16} />
          </button>
          <button
            type="button"
            className={`style-icon-btn ${style.fontStyle === 'italic' ? 'active' : ''}`}
            onClick={toggleItalic}
            title="Italic"
          >
            <Italic size={16} />
          </button>
          <button
            type="button"
            className={`style-icon-btn ${style.textDecoration === 'underline' ? 'active' : ''}`}
            onClick={toggleUnderline}
            title="Underline"
          >
            <Underline size={16} />
          </button>
        </div>
      </div>

      <div className="style-group">
        <label className="style-label">Alignment</label>
        <div className="style-button-group">
          <button
            type="button"
            className={`style-icon-btn ${style.textAlign === 'left' ? 'active' : ''}`}
            onClick={() => setAlignment('left')}
            title="Align Left"
          >
            <AlignLeft size={16} />
          </button>
          <button
            type="button"
            className={`style-icon-btn ${style.textAlign === 'center' ? 'active' : ''}`}
            onClick={() => setAlignment('center')}
            title="Align Center"
          >
            <AlignCenter size={16} />
          </button>
          <button
            type="button"
            className={`style-icon-btn ${style.textAlign === 'right' ? 'active' : ''}`}
            onClick={() => setAlignment('right')}
            title="Align Right"
          >
            <AlignRight size={16} />
          </button>
        </div>
      </div>

      <div className="style-group">
        <label className="style-label">Text Color</label>
        <div className="color-input-group">
          <input
            type="color"
            value={style.textColor || '#000000'}
            onChange={(e) => updateStyle({ textColor: e.target.value })}
            className="style-color-input"
          />
          <input
            type="text"
            value={style.textColor || '#000000'}
            onChange={(e) => updateStyle({ textColor: e.target.value })}
            className="style-text-input"
            placeholder="#000000"
          />
        </div>
      </div>
    </>
  );

  const renderTableControls = () => (
    <div className="style-group">
      <label className="style-label">Table Template</label>
      <div className="template-grid">
        <button
          type="button"
          className={`template-btn ${block.content.tableData?.template === 'default' || !block.content.tableData?.template ? 'active' : ''}`}
          onClick={() => {
            // This will be handled by the parent component
          }}
        >
          Default
        </button>
        <button
          type="button"
          className={`template-btn ${block.content.tableData?.template === 'striped' ? 'active' : ''}`}
          onClick={() => {
            // This will be handled by the parent component
          }}
        >
          Striped
        </button>
        <button
          type="button"
          className={`template-btn ${block.content.tableData?.template === 'bordered' ? 'active' : ''}`}
          onClick={() => {
            // This will be handled by the parent component
          }}
        >
          Bordered
        </button>
        <button
          type="button"
          className={`template-btn ${block.content.tableData?.template === 'minimal' ? 'active' : ''}`}
          onClick={() => {
            // This will be handled by the parent component
          }}
        >
          Minimal
        </button>
      </div>
    </div>
  );

  const renderCommonControls = () => (
    <>
      <div className="style-group">
        <label className="style-label">Background Color</label>
        <div className="color-input-group">
          <input
            type="color"
            value={style.backgroundColor || '#ffffff'}
            onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
            className="style-color-input"
          />
          <input
            type="text"
            value={style.backgroundColor || '#ffffff'}
            onChange={(e) => updateStyle({ backgroundColor: e.target.value })}
            className="style-text-input"
            placeholder="#ffffff"
          />
        </div>
      </div>

      <div className="style-group">
        <label className="style-label">Border Color</label>
        <div className="color-input-group">
          <input
            type="color"
            value={style.borderColor || '#e5e7eb'}
            onChange={(e) => updateStyle({ borderColor: e.target.value })}
            className="style-color-input"
          />
          <input
            type="text"
            value={style.borderColor || '#e5e7eb'}
            onChange={(e) => updateStyle({ borderColor: e.target.value })}
            className="style-text-input"
            placeholder="#e5e7eb"
          />
        </div>
      </div>

      <div className="style-group">
        <label className="style-label">Border Radius</label>
        <select
          className="style-select"
          value={style.borderRadius || '8px'}
          onChange={(e) => updateStyle({ borderRadius: e.target.value })}
        >
          <option value="0px">None</option>
          <option value="4px">Small</option>
          <option value="8px">Medium</option>
          <option value="12px">Large</option>
          <option value="16px">Extra Large</option>
          <option value="9999px">Full</option>
        </select>
      </div>
    </>
  );

  return (
    <div
      className="style-panel"
      style={{
        left: position.x,
        top: position.y,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="style-panel-header">
        <div className="style-panel-title">
          <Palette size={18} />
          <span>Style Controls</span>
        </div>
        <button className="style-close-btn" onClick={onClose}>
          <X size={18} />
        </button>
      </div>

      <div className="style-panel-body">
        {(block.type === 'text' || block.type === 'heading') && renderTextControls()}
        {block.type === 'table' && renderTableControls()}
        {renderCommonControls()}
      </div>
    </div>
  );
};
