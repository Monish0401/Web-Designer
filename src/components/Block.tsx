import React from 'react';
import { Block as BlockType } from '../types';
import { LeafletMapBlock } from './LeafletMapBlock';

interface BlockProps {
  block: BlockType;
  isSelected: boolean;
  onMouseDown: (e: React.MouseEvent, blockId: string) => void;
  onClick: (blockId: string) => void;
  onResizeStart: (e: React.MouseEvent, blockId: string, handle: string) => void;
}

export const Block: React.FC<BlockProps> = ({
  block,
  isSelected,
  onMouseDown,
  onClick,
  onResizeStart,
}) => {
  const handleMouseDown = (e: React.MouseEvent) => {
    onMouseDown(e, block.id);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick(block.id);
  };

  const handleResizeMouseDown = (e: React.MouseEvent, handle: string) => {
    e.stopPropagation();
    onResizeStart(e, block.id, handle);
  };

  const renderContent = () => {
    const textStyle: React.CSSProperties = {
      fontFamily: block.style?.fontFamily,
      fontSize: block.style?.fontSize,
      fontWeight: block.style?.fontWeight,
      fontStyle: block.style?.fontStyle,
      textDecoration: block.style?.textDecoration,
      textAlign: block.style?.textAlign,
      color: block.style?.textColor,
      width: '100%',
    };

    switch (block.type) {
      case 'heading':
        return (
          <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 600, ...textStyle }}>
            {block.content.heading || 'Heading'}
          </h2>
        );
      case 'text':
        return (
          <p style={{ margin: 0, lineHeight: 1.6, ...textStyle }}>
            {block.content.text || 'Text content'}
          </p>
        );
      case 'image':
        const imageSrc = block.content.imageFile || block.content.imageUrl || 'https://via.placeholder.com/300x200';
        return (
          <img
            src={imageSrc}
            alt={block.content.imageAlt || 'Image'}
            style={{ maxWidth: '100%', height: 'auto', display: 'block' }}
          />
        );
      case 'list':
        const ListTag = block.content.listType === 'ordered' ? 'ol' : 'ul';
        return (
          <ListTag style={{ margin: 0, paddingLeft: '20px' }}>
            {(block.content.listItems || ['Item 1', 'Item 2', 'Item 3']).map(
              (item, index) => (
                <li key={index}>{item}</li>
              )
            )}
          </ListTag>
        );
      case 'table':
        const headers = block.content.tableData?.headers || ['Column 1', 'Column 2'];
        const rows = block.content.tableData?.rows || [
          ['Data 1', 'Data 2'],
          ['Data 3', 'Data 4'],
        ];
        const template = block.content.tableData?.template || 'default';
        return (
          <table className={`custom-data-table table-${template}`}>
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        );

      case 'map':
        return (
          <div style={{ width: '100%', minHeight: '240px' }}>
            <LeafletMapBlock mapData={block.content.mapData} />
          </div>
        );

      case 'button':
        const buttonTemplate = block.content.buttonTemplate || 'primary';
        const handleButtonClick = () => {
          if (block.content.buttonOnClick) {
            try {
              // Execute the JavaScript code
              // Using Function constructor for safer evaluation
              const func = new Function(block.content.buttonOnClick);
              func();
            } catch (error) {
              console.error('Error executing button onClick:', error);
              alert('Error executing button code: ' + error);
            }
          }
        };
        return (
          <button
            className={`block-button block-button-${buttonTemplate}`}
            onClick={handleButtonClick}
            style={textStyle}
          >
            {block.content.buttonText || 'Button'}
          </button>
        );
      default:
        return <span className="empty-block-text">Empty block</span>;
    }
  };

  const style: React.CSSProperties = {
    left: block.x,
    top: block.y,
    width: block.width,
    minHeight: block.height,
    backgroundColor: block.style?.backgroundColor || '#ffffff',
    color: block.style?.textColor || '#000000',
    borderColor: isSelected ? '#2563eb' : (block.style?.borderColor || '#e5e7eb'),
    borderRadius: block.style?.borderRadius || '8px',
    padding: block.style?.padding || '16px',
    cursor: block.locked ? 'default' : 'move',
  };

  return (
    <div
      className={`canvas-block ${isSelected ? 'selected' : ''}`}
      style={style}
      onMouseDown={handleMouseDown}
      onClick={handleClick}
    >
      <div
        className="block-content"
        style={{
          justifyContent:
            block.style?.textAlign === 'center'
              ? 'center'
              : block.style?.textAlign === 'right'
                ? 'flex-end'
                : 'flex-start',
        }}
      >
        {renderContent()}
      </div>

      {isSelected && block.locked && <div className="block-lock-badge">Locked</div>}

      {isSelected && !block.locked && (
        <>
          {/* Corner resize handles */}
          <div
            className="resize-handle resize-handle-nw"
            onMouseDown={(e) => handleResizeMouseDown(e, 'nw')}
          />
          <div
            className="resize-handle resize-handle-ne"
            onMouseDown={(e) => handleResizeMouseDown(e, 'ne')}
          />
          <div
            className="resize-handle resize-handle-sw"
            onMouseDown={(e) => handleResizeMouseDown(e, 'sw')}
          />
          <div
            className="resize-handle resize-handle-se"
            onMouseDown={(e) => handleResizeMouseDown(e, 'se')}
          />

          {/* Edge resize handles */}
          <div
            className="resize-handle resize-handle-n"
            onMouseDown={(e) => handleResizeMouseDown(e, 'n')}
          />
          <div
            className="resize-handle resize-handle-s"
            onMouseDown={(e) => handleResizeMouseDown(e, 's')}
          />
          <div
            className="resize-handle resize-handle-w"
            onMouseDown={(e) => handleResizeMouseDown(e, 'w')}
          />
          <div
            className="resize-handle resize-handle-e"
            onMouseDown={(e) => handleResizeMouseDown(e, 'e')}
          />
        </>
      )}
    </div>
  );
};
