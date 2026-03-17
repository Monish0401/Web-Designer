import JSZip from 'jszip';
import { Block } from '../types';

export const generateHTML = (blocks: Block[]): string => {
  const blocksHTML = blocks
    .map((block) => {
      const style = `
        position: absolute;
        left: ${block.x}px;
        top: ${block.y}px;
        width: ${block.width}px;
        min-height: ${block.height}px;
        background: ${block.style?.backgroundColor || '#ffffff'};
        color: ${block.style?.textColor || '#000000'};
        border: 1px solid ${block.style?.borderColor || '#d5d9e1'};
        border-radius: ${block.style?.borderRadius || '8px'};
        padding: ${block.style?.padding || '16px'};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      `.trim();

      let content = '';

      switch (block.type) {
        case 'heading':
          content = `<h2 style="margin: 0; font-size: 1.5rem; font-weight: 600;">${block.content.heading || ''}</h2>`;
          break;
        case 'text':
          content = `<p style="margin: 0; line-height: 1.6;">${block.content.text || ''}</p>`;
          break;
        case 'image':
          content = `<img src="${block.content.imageUrl || ''}" alt="${block.content.imageAlt || 'Image'}" style="max-width: 100%; height: auto; display: block;" />`;
          break;
        case 'list':
          const listItems = (block.content.listItems || [])
            .map((item) => `<li>${item}</li>`)
            .join('');
          content = `<ul style="margin: 0; padding-left: 20px;">${listItems}</ul>`;
          break;
        case 'table':
          const headers = (block.content.tableData?.headers || [])
            .map((h) => `<th style="border: 1px solid #d5d9e1; padding: 8px; background: #f9fafb;">${h}</th>`)
            .join('');
          const rows = (block.content.tableData?.rows || [])
            .map((row) => {
              const cells = row.map((cell) => `<td style="border: 1px solid #d5d9e1; padding: 8px;">${cell}</td>`).join('');
              return `<tr>${cells}</tr>`;
            })
            .join('');
          content = `<table style="width: 100%; border-collapse: collapse;"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
          break;
        default:
          content = '<p>Unknown block type</p>';
      }

      return `<div style="${style}">${content}</div>`;
    })
    .join('\n    ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Canvas Export</title>
  <style>
    * {
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
      background: #f0f2f5;
    }
    .canvas-container {
      position: relative;
      width: 100%;
      min-height: 100vh;
      padding: 20px;
    }
  </style>
</head>
<body>
  <div class="canvas-container">
    ${blocksHTML}
  </div>
</body>
</html>`;
};

export const downloadHTML = (blocks: Block[], filename: string = 'canvas-export.html') => {
  const htmlContent = generateHTML(blocks);
  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadZIP = async (blocks: Block[], filename: string = 'canvas-export.zip') => {
  const zip = new JSZip();

  // Add main HTML file
  const htmlContent = generateHTML(blocks);
  zip.file('index.html', htmlContent);

  // Add a README file
  const readmeContent = `# Canvas Export

This export contains:
- index.html: The main HTML file with all blocks
- assets/: Folder for any additional assets (if applicable)

Generated on: ${new Date().toLocaleString()}
Total blocks: ${blocks.length}

## Block Types Included:
${blocks.map((b) => `- ${b.type} block (ID: ${b.id})`).join('\n')}

## Usage:
Open index.html in your web browser to view the canvas.
`;
  zip.file('README.md', readmeContent);

  // Add a CSS file for better organization
  const cssContent = `/* Canvas Export Styles */
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  padding: 0;
  font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
  background: #f0f2f5;
}

.canvas-container {
  position: relative;
  width: 100%;
  min-height: 100vh;
  padding: 20px;
}

/* Print styles */
@media print {
  .canvas-container {
    padding: 0;
  }
}
`;
  zip.file('styles.css', cssContent);

  // Create enhanced HTML with external CSS
  const enhancedHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Canvas Export</title>
  <link rel="stylesheet" href="styles.css">
</head>
<body>
  <div class="canvas-container">
    ${blocks
      .map((block) => {
        const style = `
        position: absolute;
        left: ${block.x}px;
        top: ${block.y}px;
        width: ${block.width}px;
        min-height: ${block.height}px;
        background: ${block.style?.backgroundColor || '#ffffff'};
        color: ${block.style?.textColor || '#000000'};
        border: 1px solid ${block.style?.borderColor || '#d5d9e1'};
        border-radius: ${block.style?.borderRadius || '8px'};
        padding: ${block.style?.padding || '16px'};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      `.trim();

        let content = '';

        switch (block.type) {
          case 'heading':
            content = `<h2 style="margin: 0; font-size: 1.5rem; font-weight: 600;">${block.content.heading || ''}</h2>`;
            break;
          case 'text':
            content = `<p style="margin: 0; line-height: 1.6;">${block.content.text || ''}</p>`;
            break;
          case 'image':
            content = `<img src="${block.content.imageUrl || ''}" alt="${block.content.imageAlt || 'Image'}" style="max-width: 100%; height: auto; display: block;" />`;
            break;
          case 'list':
            const listItems = (block.content.listItems || [])
              .map((item) => `<li>${item}</li>`)
              .join('');
            content = `<ul style="margin: 0; padding-left: 20px;">${listItems}</ul>`;
            break;
          case 'table':
            const headers = (block.content.tableData?.headers || [])
              .map((h) => `<th style="border: 1px solid #d5d9e1; padding: 8px; background: #f9fafb;">${h}</th>`)
              .join('');
            const rows = (block.content.tableData?.rows || [])
              .map((row) => {
                const cells = row.map((cell) => `<td style="border: 1px solid #d5d9e1; padding: 8px;">${cell}</td>`).join('');
                return `<tr>${cells}</tr>`;
              })
              .join('');
            content = `<table style="width: 100%; border-collapse: collapse;"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
            break;
        }

        return `<div style="${style}">${content}</div>`;
      })
      .join('\n    ')}
  </div>
</body>
</html>`;

  zip.file('index.html', enhancedHTML);

  // Generate and download ZIP
  const content = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const copyToClipboard = async (blocks: Block[]) => {
  const htmlContent = generateHTML(blocks);
  try {
    await navigator.clipboard.writeText(htmlContent);
    return true;
  } catch (error) {
    console.error('Failed to copy to clipboard:', error);
    return false;
  }
};
