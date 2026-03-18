import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { BlockContent } from '../../types/index';

interface AddBlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (type: string, content: BlockContent) => void;
  editMode?: boolean;
  initialType?: string;
  initialContent?: BlockContent;
}

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000';

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

  const [dbList, setDbList] = useState<string[]>([]);
  const [tableList, setTableList] = useState<string[]>([]);
  const [columnList, setColumnList] = useState<string[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const tableData = content.tableData || {
    headers: ['Column 1', 'Column 2'],
    rows: [['', '']],
    template: 'default' as const,
    database: '',
    table: '',
    availableColumns: [],
    selectedColumns: [],
    rowCount: 5,
  };

  const updateTableData = (next: Partial<typeof tableData>) => {
    const merged = {
      ...tableData,
      ...next,
    };

    const selectedColumns = merged.selectedColumns?.length
      ? merged.selectedColumns
      : merged.availableColumns?.slice(0, 2) || ['Column 1', 'Column 2'];

    const columnCount = Math.max(selectedColumns.length, 1);
    const desiredRows = Math.max(merged.rowCount || 5, 1);

    const rows = Array.from({ length: desiredRows }, (_, rowIndex) =>
      merged.rows?.[rowIndex]
        ? [...merged.rows[rowIndex], ...Array.from({ length: columnCount }, () => '')].slice(0, columnCount)
        : Array.from({ length: columnCount }, () => '')
    );

    setContent({
      ...content,
      tableData: {
        ...merged,
        headers: selectedColumns,
        selectedColumns,
        rows,
      },
    });
  };

  useEffect(() => {
    if (!isOpen || blockType !== 'table') return;

    const fetchDatabases = async () => {
      setIsLoadingData(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/databases`);
        setDbList(response.data || []);
      } catch (_error) {
        toast.error('Could not fetch databases from backend');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchDatabases();
  }, [isOpen, blockType]);

  useEffect(() => {
    if (blockType !== 'table' || !tableData.database) {
      setTableList([]);
      return;
    }

    const fetchTables = async () => {
      setIsLoadingData(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/tables`, {
          params: { db: tableData.database },
        });
        setTableList(response.data || []);
      } catch (_error) {
        toast.error('Could not fetch tables for selected database');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchTables();
  }, [blockType, tableData.database]);

  useEffect(() => {
    if (blockType !== 'table' || !tableData.database || !tableData.table) {
      setColumnList([]);
      return;
    }

    const fetchColumns = async () => {
      setIsLoadingData(true);
      try {
        const response = await axios.get(`${API_BASE_URL}/columns`, {
          params: {
            db: tableData.database,
            table: tableData.table,
          },
        });

        const columns = response.data || [];
        setColumnList(columns);

        updateTableData({
          availableColumns: columns,
          selectedColumns: columns.slice(0, Math.min(2, columns.length)),
        });
      } catch (_error) {
        toast.error('Could not fetch columns for selected table');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchColumns();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blockType, tableData.database, tableData.table]);

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
          imageAlt: file.name,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleColumnToggle = (column: string) => {
    const selectedColumns = tableData.selectedColumns || [];
    const updatedSelection = selectedColumns.includes(column)
      ? selectedColumns.filter((item) => item !== column)
      : [...selectedColumns, column];

    updateTableData({
      selectedColumns: updatedSelection.length ? updatedSelection : [column],
    });
  };

  const handleFetchTableData = async () => {
    if (!tableData.database || !tableData.table || !(tableData.selectedColumns || []).length) {
      toast.error('Select database, table, and at least one column first');
      return;
    }

    setIsLoadingData(true);
    try {
      const payload = {
        db: tableData.database,
        table: tableData.table,
        columns: tableData.selectedColumns,
        rows: tableData.rowCount || 5,
      };

      const response = await axios.post(`${API_BASE_URL}/generate-table`, payload);
      const resultRows = Array.isArray(response.data) ? response.data : [];

      const headers = tableData.selectedColumns || [];
      const normalizedRows = resultRows
        .map((row: Record<string, unknown>) => headers.map((header) => String(row?.[header] ?? '')))
        .slice(0, payload.rows);

      updateTableData({
        headers,
        rows: normalizedRows.length
          ? normalizedRows
          : Array.from({ length: payload.rows }, () => Array.from({ length: headers.length }, () => '')),
      });

      toast.success('Table data fetched from backend');
    } catch (_error) {
      toast.error('Error generating table from backend');
    } finally {
      setIsLoadingData(false);
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
      // { Changes 2
      //--------Changes 1----------
        // const headers = content.tableData?.headers || ['Column 1', 'Column 2'];
        // const rows = content.tableData?.rows || [['', '']];
        // const template = content.tableData?.template || 'default';
      //-----------Changes 1----------        
      //-----------Changes 2 -----------  
      // const tableData = content.tableData || {
      //     headers: ['Column 1', 'Column 2'],
      //     rows: [['', '']],
      //     template: 'default' as const,
      //     database: '',
      //     table: '',
      //     availableColumns: ['id', 'name', 'email'],
      //     selectedColumns: ['id', 'name'],
      //     rowCount: 5,
      //   };

      //   const selectedColumns = tableData.selectedColumns?.length
      //     ? tableData.selectedColumns
      //     : tableData.headers;

      //   const updateTableData = (next: Partial<typeof tableData>) => {
      //     const merged = {
      //       ...tableData,
      //       ...next,
      //     };

      //     const finalSelectedColumns = merged.selectedColumns?.length
      //       ? merged.selectedColumns
      //       : merged.availableColumns?.slice(0, 2) || ['Column 1', 'Column 2'];

      //     const columnCount = Math.max(finalSelectedColumns.length, 1);
      //     const desiredRows = Math.max(merged.rowCount || 5, 1);

      //     const rows = Array.from({ length: desiredRows }, (_, rowIndex) =>
      //       merged.rows?.[rowIndex]
      //         ? [...merged.rows[rowIndex]].slice(0, columnCount)
      //         : Array.from({ length: columnCount }, () => '')
      //     );

      //     setContent({
      //       ...content,
      //       tableData: {
      //         ...merged,
      //         headers: finalSelectedColumns,
      //         selectedColumns: finalSelectedColumns,
      //         rows,
      //       },
      //     });
      //   };

      //   const toggleColumn = (column: string) => {
      //     const current = selectedColumns;
      //     const exists = current.includes(column);
      //     const nextColumns = exists
      //       ? current.filter((item) => item !== column)
      //       : [...current, column];

      //     updateTableData({ selectedColumns: nextColumns.length ? nextColumns : [column] });
      //   };
      //-------------Changes 2 ----------------

        return (
          <>
            <div className="form-group">
              <label>Table Template</label>
              <select
                // value={template}
                // onChange={(e) =>
                //   setContent({
                //     ...content,
                //     tableData: {
                //       ...content.tableData,
                //       headers: content.tableData?.headers || ['Column 1', 'Column 2'],
                //       rows: content.tableData?.rows || [['', '']],
                //       template: e.target.value as any,
                //     },
                //   })
                // }
                value={tableData.template}
                onChange={(e) => updateTableData({ template: e.target.value as any })}
              >
                <option value="default">Default</option>
                <option value="striped">Striped</option>
                <option value="bordered">Bordered</option>
                <option value="minimal">Minimal</option>
              </select>
            </div>
            <div className="form-group">
              {/* <label>Table Headers (comma-separated)</label>
              
              <input
                type="text"
                value={headers.join(', ')} */}
                <label>1. Select Database</label>
              <select
                value={tableData.database || ''}
                onChange={(e) =>
                  // setContent({
                  //   ...content,
                  //   tableData: {
                  //     headers: e.target.value.split(',').map((h) => h.trim()),
                  //     rows: content.tableData?.rows || [['', '']],
                  //     template: content.tableData?.template || 'default',
                  //   },
                  updateTableData({
                    database: e.target.value,
                    table: '',
                    availableColumns: [],
                    selectedColumns: [],
                  })
                }
              //   placeholder="Name, Email, Phone"
              //   autoFocus
              //   value={tableData.database || ''}
              //   onChange={(e) => updateTableData({ database: e.target.value })}
              //   placeholder="example_db"
              // />
              >
                <option value="">-- Choose DB --</option>
                {dbList.map((db) => (
                  <option key={db} value={db}>
                    {db}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              {/* <label>Table Rows (one row per line, comma-separated values)</label>
              <textarea
                value={rows.map((row) => row.join(', ')).join('\n')} */}
              <label>2. Select Table</label>
               <select
                value={tableData.table || ''}
                disabled={!tableData.database}
                onChange={(e) =>
                  updateTableData({
                    table: e.target.value,
                    availableColumns: [],
                    selectedColumns: [],
                  })
                }
                >
                <option value="">-- Choose Table --</option>
                {tableList.map((table) => (
                  <option key={table} value={table}>
                    {table}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>3. Select Columns</label>
              <div style={{ maxHeight: '100px', overflowY: 'auto', border: '1px solid #eee', padding: '8px', marginTop: '8px' }}>
                {columnList.length === 0 && <small>Select a table first</small>}
                {columnList.map((col) => (
                  <div key={col}>
                    <input
                      type="checkbox"
                      checked={(tableData.selectedColumns || []).includes(col)}
                      onChange={() => handleColumnToggle(col)}
                      id={`table-col-${col}`}
                    />{' '}
                    <label htmlFor={`table-col-${col}`}>{col}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>4. Number of Rows</label>
              <select
                value={tableData.rowCount || 5}
                onChange={(e) => updateTableData({ rowCount: parseInt(e.target.value, 10) })}
              >
                {[5, 10, 20, 50].map((num) => (
                  <option key={num} value={num}>
                    {num} rows
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <button
                type="button"
                className="btn-primary"
                onClick={handleFetchTableData}
                disabled={isLoadingData || !(tableData.selectedColumns || []).length}
              >
                {isLoadingData ? 'Loading...' : 'Fetch Data'}
              </button>
            </div>
          </>
        );
      // } Changes 2

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
              {/* <small className="form-hint">
                Example: alert('Hello!'); or console.log('Clicked');
              </small> */}
               <small className="form-hint">Example: alert('Hello!'); or console.log('Clicked');</small>
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
                disabled={false}
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