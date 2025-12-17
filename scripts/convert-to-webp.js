/**
 * Convert all JPG/PNG images in public folder to WebP
 * Run: node scripts/convert-to-webp.js
 */

import sharp from 'sharp';
import { readdir, stat } from 'fs/promises';
import { join, extname, dirname, basename } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = join(__dirname, '../public');

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const QUALITY = 80; // WebP quality (0-100)

async function findImages(dir) {
  const images = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      images.push(...await findImages(fullPath));
    } else if (IMAGE_EXTENSIONS.includes(extname(entry.name).toLowerCase())) {
      images.push(fullPath);
    }
  }
  return images;
}

async function convertToWebP(imagePath) {
  const ext = extname(imagePath);
  const webpPath = imagePath.replace(ext, '.webp');
  
  try {
    const originalStats = await stat(imagePath);
    
    await sharp(imagePath)
      .webp({ quality: QUALITY })
      .toFile(webpPath);
    
    const webpStats = await stat(webpPath);
    const savings = ((originalStats.size - webpStats.size) / originalStats.size * 100).toFixed(1);
    
    console.log(`✅ ${basename(imagePath)} → ${basename(webpPath)} (${savings}% smaller)`);
    return { original: originalStats.size, webp: webpStats.size };
  } catch (error) {
    console.error(`❌ Error converting ${imagePath}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('🔍 Finding images in public folder...\n');
  
  const images = await findImages(PUBLIC_DIR);
  console.log(`Found ${images.length} images to convert\n`);
  
  let totalOriginal = 0;
  let totalWebP = 0;
  
  for (const image of images) {
    const result = await convertToWebP(image);
    if (result) {
      totalOriginal += result.original;
      totalWebP += result.webp;
    }
  }
  
  const totalSavings = ((totalOriginal - totalWebP) / 1024).toFixed(0);
  console.log(`\n📊 Total savings: ${totalSavings} KB`);
  console.log('\n⚠️  Remember to update image references in your code from .jpg/.png to .webp');
}

main().catch(console.error);

