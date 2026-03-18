// import JSZip from 'jszip';
// import { Block } from '../types';

// export const generateHTML = (blocks: Block[]): string => {
//   const blocksHTML = blocks
//     .map((block) => {
//       const style = `
//         position: absolute;
//         left: ${block.x}px;
//         top: ${block.y}px;
//         width: ${block.width}px;
//         min-height: ${block.height}px;
//         background: ${block.style?.backgroundColor || '#ffffff'};
//         color: ${block.style?.textColor || '#000000'};
//         border: 1px solid ${block.style?.borderColor || '#d5d9e1'};
//         border-radius: ${block.style?.borderRadius || '8px'};
//         padding: ${block.style?.padding || '16px'};
//         box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
//       `.trim();

//       let content = '';

//       switch (block.type) {
//         case 'heading':
//           content = `<h2 style="margin: 0; font-size: 1.5rem; font-weight: 600;">${block.content.heading || ''}</h2>`;
//           break;
//         case 'text':
//           content = `<p style="margin: 0; line-height: 1.6;">${block.content.text || ''}</p>`;
//           break;
//         case 'image':
//           content = `<img src="${block.content.imageUrl || ''}" alt="${block.content.imageAlt || 'Image'}" style="max-width: 100%; height: auto; display: block;" />`;
//           break;
//         case 'list':
//           const listItems = (block.content.listItems || [])
//             .map((item) => `<li>${item}</li>`)
//             .join('');
//           content = `<ul style="margin: 0; padding-left: 20px;">${listItems}</ul>`;
//           break;
//         case 'table':
//           const headers = (block.content.tableData?.headers || [])
//             .map((h) => `<th style="border: 1px solid #d5d9e1; padding: 8px; background: #f9fafb;">${h}</th>`)
//             .join('');
//           const rows = (block.content.tableData?.rows || [])
//             .map((row) => {
//               const cells = row.map((cell) => `<td style="border: 1px solid #d5d9e1; padding: 8px;">${cell}</td>`).join('');
//               return `<tr>${cells}</tr>`;
//             })
//             .join('');
//           content = `<table style="width: 100%; border-collapse: collapse;"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
//           break;
//         default:
//           content = '<p>Unknown block type</p>';
//       }

//       return `<div style="${style}">${content}</div>`;
//     })
//     .join('\n    ');

//   return `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Canvas Export</title>
//   <style>
//     * {
//       box-sizing: border-box;
//     }
//     body {
//       margin: 0;
//       padding: 0;
//       font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
//       background: #f0f2f5;
//     }
//     .canvas-container {
//       position: relative;
//       width: 100%;
//       min-height: 100vh;
//       padding: 20px;
//     }
//   </style>
// </head>
// <body>
//   <div class="canvas-container">
//     ${blocksHTML}
//   </div>
// </body>
// </html>`;
// };

// export const downloadHTML = (blocks: Block[], filename: string = 'canvas-export.html') => {
//   const htmlContent = generateHTML(blocks);
//   const blob = new Blob([htmlContent], { type: 'text/html' });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.href = url;
//   link.download = filename;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url);
// };

// export const downloadZIP = async (blocks: Block[], filename: string = 'canvas-export.zip') => {
//   const zip = new JSZip();

//   // Add main HTML file
//   const htmlContent = generateHTML(blocks);
//   zip.file('index.html', htmlContent);

//   // Add a README file
//   const readmeContent = `# Canvas Export

// This export contains:
// - index.html: The main HTML file with all blocks
// - assets/: Folder for any additional assets (if applicable)

// Generated on: ${new Date().toLocaleString()}
// Total blocks: ${blocks.length}

// ## Block Types Included:
// ${blocks.map((b) => `- ${b.type} block (ID: ${b.id})`).join('\n')}

// ## Usage:
// Open index.html in your web browser to view the canvas.
// `;
//   zip.file('README.md', readmeContent);

//   // Add a CSS file for better organization
//   const cssContent = `/* Canvas Export Styles */
// * {
//   box-sizing: border-box;
// }

// body {
//   margin: 0;
//   padding: 0;
//   font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
//   background: #f0f2f5;
// }

// .canvas-container {
//   position: relative;
//   width: 100%;
//   min-height: 100vh;
//   padding: 20px;
// }

// /* Print styles */
// @media print {
//   .canvas-container {
//     padding: 0;
//   }
// }
// `;
//   zip.file('styles.css', cssContent);

//   // Create enhanced HTML with external CSS
//   const enhancedHTML = `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Canvas Export</title>
//   <link rel="stylesheet" href="styles.css">
// </head>
// <body>
//   <div class="canvas-container">
//     ${blocks
//       .map((block) => {
//         const style = `
//         position: absolute;
//         left: ${block.x}px;
//         top: ${block.y}px;
//         width: ${block.width}px;
//         min-height: ${block.height}px;
//         background: ${block.style?.backgroundColor || '#ffffff'};
//         color: ${block.style?.textColor || '#000000'};
//         border: 1px solid ${block.style?.borderColor || '#d5d9e1'};
//         border-radius: ${block.style?.borderRadius || '8px'};
//         padding: ${block.style?.padding || '16px'};
//         box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
//       `.trim();

//         let content = '';

//         switch (block.type) {
//           case 'heading':
//             content = `<h2 style="margin: 0; font-size: 1.5rem; font-weight: 600;">${block.content.heading || ''}</h2>`;
//             break;
//           case 'text':
//             content = `<p style="margin: 0; line-height: 1.6;">${block.content.text || ''}</p>`;
//             break;
//           case 'image':
//             content = `<img src="${block.content.imageUrl || ''}" alt="${block.content.imageAlt || 'Image'}" style="max-width: 100%; height: auto; display: block;" />`;
//             break;
//           case 'list':
//             const listItems = (block.content.listItems || [])
//               .map((item) => `<li>${item}</li>`)
//               .join('');
//             content = `<ul style="margin: 0; padding-left: 20px;">${listItems}</ul>`;
//             break;
//           case 'table':
//             const headers = (block.content.tableData?.headers || [])
//               .map((h) => `<th style="border: 1px solid #d5d9e1; padding: 8px; background: #f9fafb;">${h}</th>`)
//               .join('');
//             const rows = (block.content.tableData?.rows || [])
//               .map((row) => {
//                 const cells = row.map((cell) => `<td style="border: 1px solid #d5d9e1; padding: 8px;">${cell}</td>`).join('');
//                 return `<tr>${cells}</tr>`;
//               })
//               .join('');
//             content = `<table style="width: 100%; border-collapse: collapse;"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
//             break;
//         }

//         return `<div style="${style}">${content}</div>`;
//       })
//       .join('\n    ')}
//   </div>
// </body>
// </html>`;

//   zip.file('index.html', enhancedHTML);

//   // Generate and download ZIP
//   const content = await zip.generateAsync({ type: 'blob' });
//   const url = URL.createObjectURL(content);
//   const link = document.createElement('a');
//   link.href = url;
//   link.download = filename;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url);
// };

// export const copyToClipboard = async (blocks: Block[]) => {
//   const htmlContent = generateHTML(blocks);
//   try {
//     await navigator.clipboard.writeText(htmlContent);
//     return true;
//   } catch (error) {
//     console.error('Failed to copy to clipboard:', error);
//     return false;
//   }
// };

//-------------------------------------------------------------------------------------------

// import JSZip from 'jszip';
// import { Block } from '../types';

// // Helper to generate the inner HTML for blocks to avoid repetition
// const generateBlocksHTML = (blocks: Block[]): string => {
//   return blocks
//     .map((block) => {
//       const style = `
//         position: absolute;
//         left: ${block.x}px;
//         top: ${block.y}px;
//         width: ${block.width}px;
//         min-height: ${block.height}px;
//         background: ${block.style?.backgroundColor || '#ffffff'};
//         color: ${block.style?.textColor || '#000000'};
//         border: ${block.style?.borderWidth || '1px'} solid ${block.style?.borderColor || '#d5d9e1'};
//         border-radius: ${block.style?.borderRadius || '8px'};
//         padding: ${block.style?.padding || '16px'};
//         box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
//         font-family: ${block.style?.fontFamily || 'inherit'};
//         text-align: ${block.style?.textAlign || 'left'};
//       `.trim();

//       let content = '';

//       switch (block.type) {
//         case 'heading':
//           content = `<h2 style="margin: 0; font-size: ${block.style?.fontSize || '1.5rem'}; font-weight: ${block.style?.fontWeight || '600'};">${block.content.heading || ''}</h2>`;
//           break;
//         case 'text':
//           content = `<p style="margin: 0; line-height: 1.6; font-size: ${block.style?.fontSize || '1rem'};">${block.content.text || ''}</p>`;
//           break;
//         case 'image':
//           // Prioritize Base64 imageFile if available
//           const src = block.content.imageUrl || block.content.imageFile || '';
//           content = `<img src="${src}" alt="${block.content.imageAlt || 'Image'}" style="max-width: 100%; height: auto; display: block;" />`;
//           break;
//         case 'list':
//           const listTag = block.content.listType === 'ordered' ? 'ol' : 'ul';
//           const listItems = (block.content.listItems || [])
//             .map((item) => `<li>${item}</li>`)
//             .join('');
//           content = `<${listTag} style="margin: 0; padding-left: 20px;">${listItems}</${listTag}>`;
//           break;
//         case 'table':
//           const headers = (block.content.tableData?.headers || [])
//             .map((h) => `<th style="border: 1px solid #d5d9e1; padding: 8px; background: #f9fafb;">${h}</th>`)
//             .join('');
//           const rows = (block.content.tableData?.rows || [])
//             .map((row) => {
//               const cells = row.map((cell) => `<td style="border: 1px solid #d5d9e1; padding: 8px;">${cell}</td>`).join('');
//               return `<tr>${cells}</tr>`;
//             })
//             .join('');
//           content = `<table style="width: 100%; border-collapse: collapse;"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
//           break;
//         case 'button':
//           content = `<button style="padding: 10px 20px; cursor: pointer;">${block.content.buttonText || 'Button'}</button>`;
//           break;
//         default:
//           content = '<p>Unknown block type</p>';
//       }

//       return `<div style="${style}">${content}</div>`;
//     })
//     .join('\n    ');
// };

// // Reusable download trigger
// const triggerDownload = (blob: Blob, filename: string) => {
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.href = url;
//   link.download = filename;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url);
// };

// export const generateHTML = (blocks: Block[]): string => {
//   return `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Canvas Export</title>
//   <style>
//     * { box-sizing: border-box; }
//     body { margin: 0; padding: 0; font-family: Inter, system-ui, sans-serif; background: #f0f2f5; }
//     .canvas-container { position: relative; width: 100%; min-height: 100vh; padding: 20px; }
//   </style>
// </head>
// <body>
//   <div class="canvas-container">
//     ${generateBlocksHTML(blocks)}
//   </div>
// </body>
// </html>`;
// };

// export const downloadHTML = (blocks: Block[], filename: string = 'canvas-export.html') => {
//   const htmlContent = generateHTML(blocks);
//   const blob = new Blob([htmlContent], { type: 'text/html' });
//   triggerDownload(blob, filename);
// };

// export const downloadZIP = async (blocks: Block[], filename: string = 'canvas-export.zip') => {
//   const zip = new JSZip();
//   const assetsFolder = zip.folder('assets');

//   // Process blocks to handle external assets if necessary
//   const processedBlocks = blocks.map(block => {
//     if (block.type === 'image' && block.content.imageFile?.startsWith('data:image')) {
//       // Example of how you might extract Base64 to actual files in the ZIP
//       const [info, data] = block.content.imageFile.split(',');
//       const extension = info.split(';')[0].split('/')[1];
//       const imgFileName = `image-${block.id}.${extension}`;
//       assetsFolder?.file(imgFileName, data, { base64: true });

//       // Update the block reference for the ZIP's HTML to point to local file
//       return { ...block, content: { ...block.content, imageUrl: `./assets/${imgFileName}` } };
//     }
//     return block;
//   });

//   const cssContent = `
//     * { box-sizing: border-box; }
//     body { margin: 0; padding: 0; font-family: Inter, system-ui, sans-serif; background: #f0f2f5; }
//     .canvas-container { position: relative; width: 100%; min-height: 100vh; padding: 20px; }
//     @media print { .canvas-container { padding: 0; } }
//   `;

//   const enhancedHTML = `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Canvas Export</title>
//   <link rel="stylesheet" href="styles.css">
// </head>
// <body>
//   <div class="canvas-container">
//     ${generateBlocksHTML(processedBlocks)}
//   </div>
// </body>
// </html>`;

//   zip.file('index.html', enhancedHTML);
//   zip.file('styles.css', cssContent);
//   zip.file('README.md', `# Canvas Export\nGenerated on: ${new Date().toLocaleString()}`);

//   const content = await zip.generateAsync({ type: 'blob' });
//   triggerDownload(content, filename);
// };

//----------------------------------------------------------------------------------------------------

// import JSZip from 'jszip';
// import { Block } from '../types';

// const escapeHtml = (value: unknown) =>
//   String(value ?? '')
//     .replace(/&/g, '&amp;')
//     .replace(/</g, '&lt;')
//     .replace(/>/g, '&gt;')
//     .replace(/"/g, '&quot;')
//     .replace(/'/g, '&#39;');

// const normalizeListItem = (item: unknown): string => {
//   if (Array.isArray(item)) return escapeHtml(item[0] ?? '');
//   return escapeHtml(item);
// };

// const getCanvasBounds = (blocks: Block[]) => {
//   if (!blocks.length) {
//     return {
//       minX: 0,
//       minY: 0,
//       width: 1200,
//       height: 800,
//       padding: 20,
//     };
//   }

//   const minX = Math.min(...blocks.map((b) => b.x));
//   const minY = Math.min(...blocks.map((b) => b.y));
//   const maxX = Math.max(...blocks.map((b) => b.x + b.width));
//   const maxY = Math.max(...blocks.map((b) => b.y + b.height));

//   return {
//     minX,
//     minY,
//     width: Math.max(600, maxX - minX + 40),
//     height: Math.max(400, maxY - minY + 40),
//     padding: 20,
//   };
// };

// const renderBlockContent = (block: Block, includeScriptBindings: boolean) => {
//   switch (block.type) {
//     case 'heading':
//       return `<h2 class="export-heading">${escapeHtml(block.content.heading || '')}</h2>`;
//     case 'text':
//       return `<p class="export-text">${escapeHtml(block.content.text || '')}</p>`;
//     case 'image':
//       return `<img src="${escapeHtml(block.content.imageUrl || '')}" alt="${escapeHtml(
//         block.content.imageAlt || 'Image'
//       )}" class="export-image" />`;
//     case 'list': {
//       const listTag = block.content.listType === 'ordered' ? 'ol' : 'ul';
//       const listItems = (block.content.listItems || [])
//         .map((item) => `<li>${normalizeListItem(item)}</li>`)
//         .join('');
//       return `<${listTag} class="export-list">${listItems}</${listTag}>`;
//     }
//     case 'table': {
//       const headers = (block.content.tableData?.headers || [])
//         .map((h) => `<th>${escapeHtml(h)}</th>`)
//         .join('');
//       const rows = (block.content.tableData?.rows || [])
//         .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
//         .join('');
//       return `<table class="export-table"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
//     }
//     case 'button': {
//       const template = block.content.buttonTemplate || 'primary';
//       const base = `export-button export-button-${template}`;
//       const onClick = block.content.buttonOnClick || '';
//       const attr = includeScriptBindings && onClick ? ` data-onclick="${encodeURIComponent(onClick)}"` : '';
//       return `<button class="${base}"${attr}>${escapeHtml(block.content.buttonText || 'Button')}</button>`;
//     }
//     default:
//       return '<p>Unknown block type</p>';
//   }
// };

// const renderBlocks = (blocks: Block[], includeScriptBindings: boolean) => {
//   const bounds = getCanvasBounds(blocks);

//   return blocks
//     .map((block) => {
//       const style = [
//         `left: ${block.x - bounds.minX + bounds.padding}px`,
//         `top: ${block.y - bounds.minY + bounds.padding}px`,
//         `width: ${block.width}px`,
//         `min-height: ${block.height}px`,
//         `background: ${block.style?.backgroundColor || '#ffffff'}`,
//         `color: ${block.style?.textColor || '#000000'}`,
//         `border-color: ${block.style?.borderColor || '#d5d9e1'}`,
//         `border-radius: ${block.style?.borderRadius || '8px'}`,
//         `padding: ${block.style?.padding || '16px'}`,
//       ].join('; ');

//       return `<div class="export-block" style="${style}">${renderBlockContent(block, includeScriptBindings)}</div>`;
//     })
//     .join('\n    ');
// };

// const baseCss = (blocks: Block[]) => {
//   const bounds = getCanvasBounds(blocks);

//   return `* { box-sizing: border-box; }
// body {
//   margin: 0;
//   padding: 24px;
//   font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
//   background: #f0f2f5;
// }
// .canvas-container {
//   position: relative;
//   width: ${bounds.width}px;
//   min-height: ${bounds.height}px;
//   margin: 0 auto;
//   background: #ffffff;
//   border: 1px solid #d5d9e1;
//   border-radius: 12px;
//   overflow: hidden;
// }
// .export-block {
//   position: absolute;
//   border: 1px solid;
//   box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
// }
// .export-heading { margin: 0; font-size: 1.5rem; font-weight: 600; }
// .export-text { margin: 0; line-height: 1.6; }
// .export-image { max-width: 100%; height: auto; display: block; }
// .export-list { margin: 0; padding-left: 20px; }
// .export-table { width: 100%; border-collapse: collapse; }
// .export-table th, .export-table td { border: 1px solid #d5d9e1; padding: 8px; text-align: left; }
// .export-table th { background: #f9fafb; }
// .export-button {
//   cursor: pointer;
//   border: 1px solid transparent;
//   border-radius: 8px;
//   padding: 10px 14px;
//   font-size: 14px;
//   font-weight: 600;
// }
// .export-button-primary { background: #2563eb; color: #fff; }
// .export-button-secondary { background: #6b7280; color: #fff; }
// .export-button-success { background: #16a34a; color: #fff; }
// .export-button-danger { background: #dc2626; color: #fff; }
// .export-button-outline { background: #fff; color: #111827; border-color: #d1d5db; }
// `;
// };

// const scriptJs = `document.querySelectorAll('[data-onclick]').forEach((button) => {
//   button.addEventListener('click', () => {
//     const encoded = button.getAttribute('data-onclick') || '';
//     if (!encoded) return;

//     const code = decodeURIComponent(encoded);
//     // eslint-disable-next-line no-new-func
//     new Function(code)();
//   });
// });
// `;

// const buildHtml = (blocks: Block[], externalAssets = false) => {
//   const blocksHtml = renderBlocks(blocks, true);
//   const css = baseCss(blocks);

//   const styleOrLink = externalAssets
//     ? '<link rel="stylesheet" href="styles.css">'
//     : `<style>${css}</style>`;

//   const scriptRef = externalAssets
//     ? '<script src="script.js"></script>'
//     : `<script>${scriptJs}</script>`;

//   return `<!DOCTYPE html>
// <html lang="en">
// <head>
//   <meta charset="UTF-8">
//   <meta name="viewport" content="width=device-width, initial-scale=1.0">
//   <title>Canvas Export</title>
//   ${styleOrLink}
// </head>
// <body>
//   <div class="canvas-container">
//   ${blocksHtml}
//   </div>
//   ${scriptRef}
// </body>
// </html>`;
// };

// export const generateHTML = (blocks: Block[]): string => buildHtml(blocks, false);

// export const downloadHTML = (blocks: Block[], filename: string = 'canvas-export.html') => {
//   const htmlContent = generateHTML(blocks);
//   const blob = new Blob([htmlContent], { type: 'text/html' });
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   link.href = url;
//   link.download = filename;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url);
// };

// export const downloadZIP = async (blocks: Block[], filename: string = 'canvas-export.zip') => {
//   const zip = new JSZip();
//   zip.file('index.html', buildHtml(blocks, true));
//   zip.file('styles.css', baseCss(blocks));
//   zip.file('script.js', scriptJs);
//    zip.file(
//     'README.md',
//     `# Canvas Export\n\nGenerated on: ${new Date().toLocaleString()}\nTotal blocks: ${blocks.length}\n\nOpen index.html in a browser.\n`
//   );
//   // Generate and download ZIP
//   const content = await zip.generateAsync({ type: 'blob' });
//   const url = URL.createObjectURL(content);
//   const link = document.createElement('a');
//   link.href = url;
//   link.download = filename;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);
//   URL.revokeObjectURL(url);
// };

// export const copyToClipboard = async (blocks: Block[]) => {
//   const htmlContent = generateHTML(blocks);
//   try {
//     await navigator.clipboard.writeText(htmlContent);
//     return true;
//   } catch (error) {
//     console.error('Failed to copy to clipboard:', error);
//     return false;
//   }
// };

import JSZip from 'jszip';
import { Block } from '../types';

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const normalizeListItem = (item: unknown): string => {
  if (Array.isArray(item)) return escapeHtml(item[0] ?? '');
  return escapeHtml(item);
};


const getCanvasBounds = (blocks: Block[]) => {
  if (!blocks.length) {
    return {
      minX: 0,
      minY: 0,
      width: 1200,
      height: 800,
      padding: 20,
    };
  }

  const minX = Math.min(...blocks.map((b) => b.x));
  const minY = Math.min(...blocks.map((b) => b.y));
  const maxX = Math.max(...blocks.map((b) => b.x + b.width));
  const maxY = Math.max(...blocks.map((b) => b.y + b.height));

  return {
    minX,
    minY,
    width: Math.max(600, maxX - minX + 40),
    height: Math.max(400, maxY - minY + 40),
    padding: 20,
  };
};


const getImageSource = (block: Block) =>
  block.content.imageFile || block.content.imageUrl || ((block.content as any).data as string) || 'https://via.placeholder.com/300x200';

const sanitizeFileToken = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '');

const getExtensionFromMime = (mimeType: string) => {
  const mime = mimeType.toLowerCase();
  if (mime.includes('png')) return 'png';
  if (mime.includes('jpeg') || mime.includes('jpg')) return 'jpg';
  if (mime.includes('webp')) return 'webp';
  if (mime.includes('gif')) return 'gif';
  if (mime.includes('svg')) return 'svg';
  return 'png';
};

const extractExtensionFromSource = (source: string, fallback = 'png') => {
  if (source.startsWith('data:image/')) {
    const mime = source.slice(5, source.indexOf(';'));
    return getExtensionFromMime(mime);
  }

  try {
    const pathname = new URL(source).pathname;
    const ext = pathname.split('.').pop();
    return ext ? ext.toLowerCase() : fallback;
  } catch {
    return fallback;
  }
};

// Add main HTML file

const getTableData = (block: Block) => {
  const tableData = block.content.tableData as any;
  const legacyData = (block.content as any).data;

  if (tableData?.headers || tableData?.rows) {
    return {
      headers: tableData.headers || [],
      rows: tableData.rows || [],
      template: tableData.template || 'default',
    };
  }

  // Add a README file

  if (Array.isArray(legacyData) && legacyData.length > 0 && typeof legacyData[0] === 'object') {
    const headers = Object.keys(legacyData[0]);
    const rows = legacyData.map((row: Record<string, unknown>) => headers.map((h) => String(row?.[h] ?? '')));
    return { headers, rows, template: 'default' as const };
  }


  return {
    headers: ['Column 1', 'Column 2'],
    rows: [
      ['Data 1', 'Data 2'],
      ['Data 3', 'Data 4'],
    ],
    template: 'default' as const,
  };
};

const renderBlockContent = (block: Block, includeScriptBindings: boolean) => {
  switch (block.type) {
    case 'heading':
      return `<h2 class="export-heading">${escapeHtml(block.content.heading || '')}</h2>`;
    case 'text':
      return `<p class="export-text">${escapeHtml(block.content.text || '')}</p>`;
    case 'image':
      return `<img src="${escapeHtml(getImageSource(block))}" alt="${escapeHtml(
        block.content.imageAlt || 'Image'
      )}" class="export-image" />`;
    case 'list': {
      const listTag = block.content.listType === 'ordered' ? 'ol' : 'ul';
      const listItems = (block.content.listItems || [])
        .map((item) => `<li>${normalizeListItem(item)}</li>`)
        .join('');
      return `<${listTag} class="export-list">${listItems}</${listTag}>`;
    }
    case 'table': {
      const table = getTableData(block);
      const headers = table.headers.map((h: string) => `<th>${escapeHtml(h)}</th>`).join('');
      const rows = table.rows
        .map((row: string[]) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
        .join('');
      return `<table class="export-table export-table-${table.template}"><thead><tr>${headers}</tr></thead><tbody>${rows}</tbody></table>`;
    }
    case 'button': {
      const template = block.content.buttonTemplate || 'primary';
      const base = `export-button export-button-${template}`;
      const onClick = block.content.buttonOnClick || '';
      const attr = includeScriptBindings && onClick ? ` data-onclick="${encodeURIComponent(onClick)}"` : '';
      return `<button class="${base}"${attr}>${escapeHtml(block.content.buttonText || 'Button')}</button>`;
    }
    default:
      return '<p>Unknown block type</p>';
  }
};


const renderBlocks = (blocks: Block[], includeScriptBindings: boolean) => {
  const bounds = getCanvasBounds(blocks);

  return blocks
    .map((block) => {
      const style = [
        `left: ${block.x - bounds.minX + bounds.padding}px`,
        `top: ${block.y - bounds.minY + bounds.padding}px`,
        `width: ${block.width}px`,
        `min-height: ${block.height}px`,
        `background: ${block.style?.backgroundColor || '#ffffff'}`,
        `color: ${block.style?.textColor || '#000000'}`,
        // `border-color: ${block.style?.borderColor || '#d5d9e1'}`,
        `border-radius: ${block.style?.borderRadius || '8px'}`,
        `padding: ${block.style?.padding || '16px'}`,
        `font-family: ${block.style?.fontFamily || 'inherit'}`,
        `font-size: ${block.style?.fontSize || 'inherit'}`,
        `font-weight: ${block.style?.fontWeight || 'inherit'}`,
        `font-style: ${block.style?.fontStyle || 'normal'}`,
        `text-decoration: ${block.style?.textDecoration || 'none'}`,
        `text-align: ${block.style?.textAlign || 'left'}`,
      ].join('; ');

      return `<div class="export-block" style="${style}">${renderBlockContent(block, includeScriptBindings)}</div>`;
    })
    .join('\n    ');
};


const baseCss = (blocks: Block[]) => {
  const bounds = getCanvasBounds(blocks);

  return `* { box-sizing: border-box; }
 body {
   margin: 0;

  padding: 24px;
   font-family: Inter, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
   background: #f0f2f5;
 }

 .canvas-container {
   position: relative;

  width: ${bounds.width}px;
  min-height: ${bounds.height}px;
  margin: 0 auto;
  background: #ffffff;
  border: 1px solid #d5d9e1;
  border-radius: 12px;
  overflow: hidden;
 }

.export-block {
  position: absolute;
  border: none;
  box-shadow: none;
}
.export-heading { margin: 0; font-size: 1.5rem; font-weight: 600; }
.export-text { margin: 0; line-height: 1.6; }
.export-image { max-width: 100%; height: auto; display: block; }
.export-list { margin: 0; padding-left: 20px; }
.export-table { width: 100%; border-collapse: collapse; }
.export-table th, .export-table td { border: 1px solid #d5d9e1; padding: 8px; text-align: left; }
.export-table th { background: #f9fafb; }
.export-table-striped tbody tr:nth-child(even) { background: #f8fafc; }
.export-table-bordered th, .export-table-bordered td { border-width: 1.5px; }
.export-table-minimal th, .export-table-minimal td { border-left: none; border-right: none; }
.export-button {
  cursor: pointer;
  border: 1px solid transparent;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  font-weight: 600;
 }
.export-button-primary { background: #2563eb; color: #fff; }
.export-button-secondary { background: #6b7280; color: #fff; }
.export-button-success { background: #16a34a; color: #fff; }
.export-button-danger { background: #dc2626; color: #fff; }
.export-button-outline { background: #fff; color: #111827; border-color: #d1d5db; }
`;
};

const scriptJs = `document.querySelectorAll('[data-onclick]').forEach((button) => {
  button.addEventListener('click', () => {
    const encoded = button.getAttribute('data-onclick') || '';
    if (!encoded) return;

    const code = decodeURIComponent(encoded);
    // eslint-disable-next-line no-new-func
    new Function(code)();
  });
});
 `;


// Create enhanced HTML with external CSS

const buildHtml = (blocks: Block[], externalAssets = false) => {
  const blocksHtml = renderBlocks(blocks, true);
  const css = baseCss(blocks);

  const styleOrLink = externalAssets
    ? '<link rel="stylesheet" href="styles.css">'
    : `<style>${css}</style>`;

  const scriptRef = externalAssets
    ? '<script src="script.js"></script>'
    : `<script>${scriptJs}</script>`;

  return `<!DOCTYPE html>
 <html lang="en">
 <head>
   <meta charset="UTF-8">
   <meta name="viewport" content="width=device-width, initial-scale=1.0">
   <title>Canvas Export</title>

 ${styleOrLink}
 </head>
 <body>
   <div class="canvas-container">


    ${blocksHtml}
   </div>
  ${scriptRef}
 </body>
 </html>`;
};

export const generateHTML = (blocks: Block[]): string => buildHtml(blocks, false);

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
  const processedBlocks = await Promise.all(
    blocks.map(async (block, index) => {
      if (block.type !== 'image') return block;

      const source = getImageSource(block);
      if (!source) return block;

      try {
        const response = await fetch(source);
        if (!response.ok) return block;

        const blob = await response.blob();
        const extensionFromMime = getExtensionFromMime(blob.type || '');
        const extensionFromSource = extractExtensionFromSource(source, extensionFromMime);
        const extension = extensionFromSource || extensionFromMime || 'png';
        const fileName = `assets/image-${sanitizeFileToken(block.id) || index}.${extension}`;

        zip.file(fileName, blob);

        const { imageFile, ...restContent } = block.content;
        return {
          ...block,
          content: {
            ...restContent,
            imageUrl: fileName,
          },
        };
      } catch {
        return block;
      }
    })
  );

  zip.file('index.html', buildHtml(processedBlocks, true));
  zip.file('styles.css', baseCss(processedBlocks));
  zip.file('script.js', scriptJs);


  zip.file(
    'README.md',
    `# Canvas Export\n\nGenerated on: ${new Date().toLocaleString()}\nTotal blocks: ${processedBlocks.length}\n\nOpen index.html in a browser.\n`
  );

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

