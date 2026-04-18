// Placeholder icon generator for PWA
// This script creates simple colored squares as placeholder icons
// In a real project, you would use proper icon files

const fs = require('fs');
const path = require('path');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const iconsDir = path.join(__dirname, 'public', 'icons');

// Create a simple SVG icon
function createSVGIcon(size) {
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#6366F1;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#8B5CF6;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#grad1)"/>
    <text x="${size/2}" y="${size/2 + size * 0.1}" font-family="Arial, sans-serif" font-size="${size * 0.3}" font-weight="bold" text-anchor="middle" fill="white">🎓</text>
  </svg>`;
}

// Ensure icons directory exists
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

// Generate SVG files for each size
sizes.forEach(size => {
  const svgContent = createSVGIcon(size);
  const filePath = path.join(iconsDir, `icon-${size}x${size}.svg`);
  fs.writeFileSync(filePath, svgContent);
  console.log(`Generated ${filePath}`);
});

// Create a simple favicon
const faviconSVG = createSVGIcon(32);
fs.writeFileSync(path.join(__dirname, 'public', 'favicon.svg'), faviconSVG);

console.log('Icon generation complete!');
console.log('Note: These are placeholder SVG icons. For production, use proper PNG/ICO files.');