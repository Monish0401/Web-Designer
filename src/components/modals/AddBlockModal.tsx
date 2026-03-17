import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { BlockContent } from '../../types/index';

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: string, content: BlockContent) => void;
  editMode?: boolean;
  initialType?: string;
  initialContent?: BlockContent;
}

export const AddBlockModal: React.FC<AddBlockModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  editMode = false,
  initialType = 'text',
  initialContent = {},
}) => {
  const [blockType, setBlockType] = useState(initialType);
  const [content, setContent] = useState<BlockContent>(initialContent);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdd(blockType, content);
    onClose();
    // Reset form
    setBlockType('text');
    setContent({});
  };

  const handleCancel = () => {
    onClose();
    setBlockType('text');
    setContent({});
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setContent({
          ...content,
          imageFile: reader.result as string,
          imageAlt: file.name
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const renderContentFields = () => {
    switch (blockType) {
      case 'heading':
        return (
          <div className="form-group">
            <label>Heading Text</label>
            <input
              type="text"
              value={content.heading || ''}
              onChange={(e) => setContent({ ...content, heading: e.target.value })}
              placeholder="Enter heading text..."
              autoFocus
            />
          </div>
        );

      case 'text':
        return (
          <div className="form-group">
            <label>Text Content</label>
            <textarea
              value={content.text || ''}
              onChange={(e) => setContent({ ...content, text: e.target.value })}
              placeholder="Enter text content..."
              rows={5}
              autoFocus
            />
          </div>
        );

      case 'image':
        return (
          <>
            <div className="form-group">
              <label>Upload Image</label>
              <div className="upload-area">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="file-input"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="upload-label">
                  <Upload size={24} />
                  <span>Choose an image file</span>
                </label>
                {content.imageFile && (
                  <div className="image-preview">
                    <img src={content.imageFile} alt="Preview" />
                  </div>
                )}
              </div>
            </div>
            <div className="form-group">
              <label>Or Enter Image URL</label>
              <input
                type="url"
                value={content.imageUrl || ''}
                onChange={(e) => setContent({ ...content, imageUrl: e.target.value, imageFile: undefined })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="form-group">
              <label>Image Alt Text</label>
              <input
                type="text"
                value={content.imageAlt || ''}
                onChange={(e) => setContent({ ...content, imageAlt: e.target.value })}
                placeholder="Description of the image"
              />
            </div>
          </>
        );

      case 'list':
        return (
          <>
            <div className="form-group">
              <label>List Type</label>
              <select
                value={content.listType || 'unordered'}
                onChange={(e) => setContent({ ...content, listType: e.target.value as 'unordered' | 'ordered' })}
              >
                <option value="unordered">Bullet List</option>
                <option value="ordered">Numbered List</option>
              </select>
            </div>
            <div className="form-group">
              <label>List Items (one per line)</label>
              <textarea
                value={(content.listItems || []).join('\n')}
                onChange={(e) =>
                  setContent({
                    ...content,
                    // Option A: Wrap each item in an array to match string[][]
                    listItems: e.target.value
                      .split('\n')
                      .filter((item) => item.trim())
                      .map((item) => [item]), // This turns "string" into ["string"],
                  })
                }
                placeholder="Item 1&#10;Item 2&#10;Item 3"
                rows={6}
                autoFocus
              />
            </div>
          </>
        );

      case 'table':
        const headers = content.tableData?.headers || ['Column 1', 'Column 2'];
        const rows = content.tableData?.rows || [['', '']];
        const template = content.tableData?.template || 'default';

        return (
          <>
            <div className="form-group">
              <label>Table Template</label>
              <select
                value={template}
                onChange={(e) =>
                  setContent({
                    ...content,
                    tableData: {
                      ...content.tableData,
                      headers: content.tableData?.headers || ['Column 1', 'Column 2'],
                      rows: content.tableData?.rows || [['', '']],
                      template: e.target.value as any,
                    },
                  })
                }
              >
                <option value="default">Default</option>
                <option value="striped">Striped</option>
                <option value="bordered">Bordered</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <div className="form-group">
              <label>Table Headers (comma-separated)</label>
              <input
                type="text"
                value={headers.join(', ')}
                onChange={(e) =>
                  setContent({
                    ...content,
                    tableData: {
                      headers: e.target.value.split(',').map((h) => h.trim()),
                      rows: content.tableData?.rows || [['', '']],
                      template: content.tableData?.template || 'default',
                    },
                  })
                }
                placeholder="Name, Email, Phone"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Table Rows (one row per line, comma-separated values)</label>
              <textarea
                value={rows.map((row) => row.join(', ')).join('\n')}
                onChange={(e) =>
                  setContent({
                    ...content,
                    tableData: {
                      headers: content.tableData?.headers || ['Column 1', 'Column 2'],
                      rows: e.target.value
                        .split('\n')
                        .filter((line) => line.trim())
                        .map((line) => line.split(',').map((cell) => cell.trim())),
                      template: content.tableData?.template || 'default',
                    },
                  })
                }
                placeholder="John Doe, john@example.com, 555-1234&#10;Jane Smith, jane@example.com, 555-5678"
                rows={4}
              />
            </div>
          </>
        );

      case 'button':
        return (
          <>
            <div className="form-group">
              <label>Button Text</label>
              <input
                type="text"
                value={content.buttonText || ''}
                onChange={(e) => setContent({ ...content, buttonText: e.target.value })}
                placeholder="Click Me"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Button Template</label>
              <select
                value={content.buttonTemplate || 'primary'}
                onChange={(e) => setContent({ ...content, buttonTemplate: e.target.value as any })}
              >
                <option value="primary">Primary</option>
                <option value="secondary">Secondary</option>
                <option value="success">Success</option>
                <option value="danger">Danger</option>
                <option value="outline">Outline</option>
              </select>
            </div>
            <div className="form-group">
              <label>OnClick JavaScript (optional)</label>
              <textarea
                value={content.buttonOnClick || ''}
                onChange={(e) => setContent({ ...content, buttonOnClick: e.target.value })}
                placeholder="alert('Button clicked!');"
                rows={4}
              />
              <small className="form-hint">
                Example: alert('Hello!'); or console.log('Clicked');
              </small>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={handleCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editMode ? 'Edit Block' : 'Add New Block'}</h2>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Block Type</label>
              <select
                value={blockType}
                onChange={(e) => {
                  setBlockType(e.target.value);
                  setContent({});
                }}
                disabled={editMode}
              >
                <option value="heading">Heading</option>
                <option value="text">Text</option>
                <option value="image">Image</option>
                <option value="list">List</option>
                <option value="table">Table</option>
                <option value="button">Button</option>
              </select>
            </div>

            {renderContentFields()}
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={handleCancel}>
              Cancel
            </button>
            <button type="submit" className="btn-primary">
              {editMode ? 'Update' : 'Add'} Block
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};