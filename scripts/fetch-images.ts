#!/usr/bin/env node
/**
 * Pexels API Image Pipeline
 *
 * Reads all MDX files, extracts image frontmatter, and downloads images from Pexels.
 * Rate limited to 200ms between requests.
 */

import fs from 'fs';
import path from 'path';
import https from 'https';
import matter from 'gray-matter';

const PEXELS_API_KEY = 'auC4jZ0hXy8yWDBX2UakTc0ywXJ4BIS99taY8HJRZx2Y9K5w6K3iDmmv';
const CONTENT_DIR = path.join(process.cwd(), 'content');
const OUTPUT_DIR = path.join(process.cwd(), 'public', 'images', 'cards');
const RATE_LIMIT_MS = 200;

interface ImageEntry {
  [key: string]: string;
}

interface FrontmatterData {
  images?: ImageEntry;
  [key: string]: any;
}

/**
 * Sleep utility for rate limiting
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Search Pexels API for images
 */
async function searchPexels(query: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`;

    const options = {
      headers: {
        'Authorization': PEXELS_API_KEY
      }
    };

    https.get(url, options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          if (json.photos && json.photos.length > 0) {
            // Get large image URL (1280x853)
            resolve(json.photos[0].src.large);
          } else {
            console.warn(`⚠️  No results for query: "${query}"`);
            resolve(null);
          }
        } catch (err) {
          console.error(`❌ Failed to parse Pexels response for "${query}":`, err);
          resolve(null);
        }
      });
    }).on('error', (err) => {
      console.error(`❌ Network error searching Pexels for "${query}":`, err.message);
      resolve(null);
    });
  });
}

/**
 * Download image from URL
 */
async function downloadImage(url: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(outputPath);

    https.get(url, (res) => {
      res.pipe(file);

      file.on('finish', () => {
        file.close();
        resolve(true);
      });

      file.on('error', (err) => {
        console.error(`❌ Failed to write file ${outputPath}:`, err.message);
        fs.unlink(outputPath, () => {});
        resolve(false);
      });
    }).on('error', (err) => {
      console.error(`❌ Failed to download ${url}:`, err.message);
      fs.unlink(outputPath, () => {});
      resolve(false);
    });
  });
}

/**
 * Recursively find all MDX files
 */
function findMdxFiles(dir: string): string[] {
  const results: string[] = [];
  const items = fs.readdirSync(dir);

  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...findMdxFiles(fullPath));
    } else if (item.endsWith('.mdx')) {
      results.push(fullPath);
    }
  }

  return results;
}

/**
 * Extract slug from file path
 * Example: content/business/blue-ocean.mdx -> blue-ocean
 */
function getSlugFromPath(filePath: string): string {
  const fileName = path.basename(filePath, '.mdx');
  return fileName;
}

/**
 * Main processing logic
 */
async function main() {
  console.log('🎬 Starting Pexels Image Pipeline...\n');

  // Find all MDX files
  const mdxFiles = findMdxFiles(CONTENT_DIR);
  console.log(`📄 Found ${mdxFiles.length} MDX files\n`);

  let totalProcessed = 0;
  let totalSkipped = 0;
  let totalDownloaded = 0;
  let totalFailed = 0;

  for (const filePath of mdxFiles) {
    const relativePath = path.relative(CONTENT_DIR, filePath);
    const slug = getSlugFromPath(filePath);

    console.log(`📝 Processing: ${relativePath}`);

    // Read and parse frontmatter
    let fileContent: string;
    try {
      fileContent = fs.readFileSync(filePath, 'utf-8');
    } catch (err) {
      console.error(`❌ Failed to read file: ${err}`);
      continue;
    }

    const { data } = matter(fileContent) as { data: FrontmatterData };

    if (!data.images || typeof data.images !== 'object') {
      console.log(`   ⏭️  No images field, skipping\n`);
      totalSkipped++;
      continue;
    }

    // Create output directory for this card
    const cardDir = path.join(OUTPUT_DIR, slug);
    if (!fs.existsSync(cardDir)) {
      fs.mkdirSync(cardDir, { recursive: true });
    }

    // Process each image entry
    const imageEntries = Object.entries(data.images);

    for (const [key, query] of imageEntries) {
      const outputPath = path.join(cardDir, `${key}.jpg`);

      // Skip if file already exists
      if (fs.existsSync(outputPath)) {
        console.log(`   ✅ ${key}.jpg already exists, skipping`);
        totalSkipped++;
        continue;
      }

      console.log(`   🔍 Searching Pexels for: "${query}"`);

      // Search Pexels
      const imageUrl = await searchPexels(query);

      if (!imageUrl) {
        console.log(`   ❌ No image found for "${query}"\n`);
        totalFailed++;
        await sleep(RATE_LIMIT_MS);
        continue;
      }

      // Download image
      console.log(`   ⬇️  Downloading to ${key}.jpg...`);
      const success = await downloadImage(imageUrl, outputPath);

      if (success) {
        console.log(`   ✅ Downloaded ${key}.jpg\n`);
        totalDownloaded++;
      } else {
        totalFailed++;
      }

      totalProcessed++;

      // Rate limit
      await sleep(RATE_LIMIT_MS);
    }
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📊 Pipeline Complete!\n');
  console.log(`   Total processed: ${totalProcessed}`);
  console.log(`   Downloaded:      ${totalDownloaded}`);
  console.log(`   Skipped:         ${totalSkipped}`);
  console.log(`   Failed:          ${totalFailed}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
}

// Run the pipeline
main().catch((err) => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
