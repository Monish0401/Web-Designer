export interface Block {
  id: string;
  type: 'text' | 'heading' | 'image' | 'table' | 'list' | 'button' | 'map';
  x: number;
  y: number;
  width: number;
  height: number;
  content: BlockContent;
  style?: BlockStyle;
  locked?: boolean;
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
    database?: string;
    table?: string;
    availableColumns?: string[];
    selectedColumns?: string[];
    rowCount?: number;
  };
  mapData?: {
    latitude: number;
    longitude: number;
    zoom: number;
    markerLabel?: string;
    tileStyle?: 'street' | 'satellite' | 'terrain';
    showScale?: boolean;
    showZoomControl?: boolean;
    enableScrollZoom?: boolean;
    enableLiveLocation?: boolean;
    showLayerControl?: boolean;
    tileSourceMode?: 'offline' | 'online';
    tileUrlTemplate?: string;
    leafletAssetPath?: string;
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