export interface Block {
  id: string;
  type: 'text' | 'heading' | 'image' | 'table' | 'list' | 'button';
  x: number;
  y: number;
  width: number;
  height: number;
  content: BlockContent;
  style?: BlockStyle;
}

export interface BlockContent {
  text?: string;
  heading?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageFile?: string; // Base64 encoded image data
  listItems?: string[][];
  listType?: 'unordered' | 'ordered';
  tableData?: {
    headers: string[];
    rows: string[][];
    template?: 'default' | 'striped' | 'bordered' | 'minimal';
  };
  buttonText?: string;
  buttonOnClick?: string; // JavaScript code to execute
  buttonTemplate?: 'primary' | 'secondary' | 'success' | 'danger' | 'outline';
}

export interface BlockStyle {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  fontSize?: string;
  fontWeight?: string;
  fontFamily?: string;
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  textAlign?: 'left' | 'center' | 'right';
  padding?: string;
  borderRadius?: string;
  borderWidth?: string;
}

export interface CanvasState {
  blocks: Block[];
  selectedBlockId: string | null;
  draggedBlockId: string | null;
}