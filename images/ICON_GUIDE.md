# Icon Placeholder

This file contains base64-encoded placeholder images for the extension icons.
These should be replaced with proper designed icons before launch.

## How to Create Icons

### Option 1: Design Custom Icons
1. Open Figma (figma.com)
2. Create 128x128 canvas
3. Design icon (recommend: shield + "AI" text)
4. Export as PNG
5. Resize to 16x16 and 48x48

### Option 2: Use Icon Generator
1. Go to favicon-generator.org
2. Upload your design
3. Download PNG files in all sizes

### Option 3: AI Image Generator
```
Prompt for DALL-E/Midjourney:
"Create a professional shield icon with an AI symbol, 
flat design, modern, clean, 128x128 pixels, 
blue and purple colors, transparent background"
```

## Icon Specifications

| Size | Filename | Usage |
|------|----------|-------|
| 16x16 | icon-16.png | Extension list |
| 48x48 | icon-48.png | Extension details |
| 128x128 | icon-128.png | Chrome Web Store |

## Creating Icons Programmatically

### Using ImageMagick
```bash
convert icon-128.png -resize 16x16 icon-16.png
convert icon-128.png -resize 48x48 icon-48.png
```

### Using Node.js
```javascript
const jimp = require('jimp');

async function resizeIcon() {
  const image = await jimp.read('icon-128.png');
  
  // Resize to 16x16
  image.resize(16, 16)
    .write('icon-16.png');
  
  // Resize to 48x48
  image.resize(48, 48)
    .write('icon-48.png');
}
```

### Using Python
```python
from PIL import Image

# Load original icon
img = Image.open('icon-128.png')

# Create 16x16 version
img_16 = img.resize((16, 16), Image.Resampling.LANCZOS)
img_16.save('icon-16.png')

# Create 48x48 version
img_48 = img.resize((48, 48), Image.Resampling.LANCZOS)
img_48.save('icon-48.png')
```

## Icon Design Guidelines

### Visual Style
- Clean, modern, flat design
- Professional appearance
- Clear at small sizes
- Scalable without loss of clarity

### Color Scheme (Recommended)
- Primary: Blue (#2563EB) or Purple (#8B5CF6)
- Secondary: Red (#EF4444) for warning aspect
- Background: White or transparent

### Symbol Ideas
- Shield (protection): ✓
- Crossed eye (blocking): ✓
- AI chip: ✓
- Checkmark: ✓
- Lock: ✓

### What to Avoid
- ✗ Too much detail (won't render at 16x16)
- ✗ Thin lines (will appear broken)
- ✗ Bright neon colors
- ✗ Gradients (scale poorly)
- ✗ Text (hard to read small)

## Testing Icons

After creating icons, verify:

1. **16x16:** Looks clear and recognizable
2. **48x48:** Details are visible
3. **128x128:** Professional quality
4. All sizes save as PNG with transparency
5. Icon looks good on light and dark backgrounds

## Recommended Tools

- **Figma** (free): Professional design tool
- **Adobe Express** (free): Simple icon creator
- **Photoshop** (paid): Industry standard
- **Canva** (free): Drag-and-drop editor
- **ImageMagick** (free): Command-line tool
- **Pillow** (free): Python library

## Quick Start Script

```bash
# If you have imagemagick installed:
magick convert icon-128.png -resize 16x16 icon-16.png
magick convert icon-128.png -resize 48x48 icon-48.png
```

## Status

- [ ] icon-16.png created
- [ ] icon-48.png created
- [ ] icon-128.png created
- [ ] Tested in manifest.json
- [ ] Tested in Chrome
- [ ] Ready for Web Store submission
