const sharp = require('sharp');
const path = require('path');

const backgroundPath = 'C:\\Users\\nural\\.gemini\\antigravity-ide\\brain\\2da06f6c-7381-4268-9591-a042e45f042f\\wif_me_og_base_v2_1781273922954.png';
const logoPath = path.join(__dirname, 'public', 'logo-icon.png');
const outputPathOg = path.join(__dirname, 'src', 'app', 'opengraph-image.png');
const outputPathTw = path.join(__dirname, 'src', 'app', 'twitter-image.png');
const outputPathPub = path.join(__dirname, 'public', 'og-thumbnail.png');

async function createThumbnail() {
  try {
    const bgInfo = await sharp(backgroundPath).metadata();
    const bgWidth = bgInfo.width;
    const bgHeight = bgInfo.height;

    const logoSize = Math.floor(bgWidth * 0.15); // 15% of width
    const resizedLogoBuffer = await sharp(logoPath)
      .resize(logoSize, logoSize, { fit: 'inside' })
      .toBuffer();
    
    const logoMeta = await sharp(resizedLogoBuffer).metadata();

    const topPos = Math.max(0, bgHeight - logoMeta.height - Math.floor(bgHeight * 0.08));
    const leftPos = Math.max(0, bgWidth - logoMeta.width - Math.floor(bgWidth * 0.05));

    // Composite logo on top of the generated background
    const compositeBuffer = await sharp(backgroundPath)
      .composite([
        {
          input: resizedLogoBuffer,
          top: topPos,
          left: leftPos
        }
      ])
      .toBuffer();

    // Save to the destination paths
    await sharp(compositeBuffer).toFile(outputPathOg);
    await sharp(compositeBuffer).toFile(outputPathTw);
    await sharp(compositeBuffer).toFile(outputPathPub);

    console.log('Successfully created pixel-perfect Open Graph thumbnail!');
  } catch (err) {
    console.error('Error generating thumbnail:', err);
  }
}

createThumbnail();
