/**
 * Image path utilities for cinematic cards
 *
 * Provides utilities for accessing step images downloaded via Pexels pipeline.
 */

import fs from 'fs';
import path from 'path';

/**
 * Get the public path for a step image
 *
 * @param slug - Card slug (e.g., "blue-ocean")
 * @param stepKey - Image key from frontmatter (e.g., "hook", "scene-1")
 * @returns Public URL path (e.g., "/images/cards/blue-ocean/hook.jpg")
 */
export function getStepImagePath(slug: string, stepKey: string): string {
  return `/images/cards/${slug}/${stepKey}.jpg`;
}

/**
 * Check if a step image exists and return its URL, or null if missing
 *
 * NOTE: This function is designed to run at build time in Next.js SSG context.
 * It checks the filesystem during build to determine if the image exists.
 *
 * @param slug - Card slug
 * @param stepKey - Image key
 * @returns Image URL if file exists, null otherwise
 */
export function getStepImageUrl(slug: string, stepKey: string): string | null {
  // At build time, check if the file exists in public/images/cards
  const publicDir = path.join(process.cwd(), 'public');
  const imagePath = path.join(publicDir, 'images', 'cards', slug, `${stepKey}.jpg`);

  try {
    if (fs.existsSync(imagePath)) {
      return getStepImagePath(slug, stepKey);
    }
  } catch (err) {
    // If filesystem access fails (e.g., in browser context), return null
    return null;
  }

  return null;
}

/**
 * Get all available image keys for a card
 *
 * @param slug - Card slug
 * @returns Array of available image keys (e.g., ["hook", "scene-1", "scene-2"])
 */
export function getAvailableImages(slug: string): string[] {
  const publicDir = path.join(process.cwd(), 'public');
  const cardDir = path.join(publicDir, 'images', 'cards', slug);

  try {
    if (!fs.existsSync(cardDir)) {
      return [];
    }

    const files = fs.readdirSync(cardDir);
    return files
      .filter(file => file.endsWith('.jpg'))
      .map(file => path.basename(file, '.jpg'));
  } catch (err) {
    return [];
  }
}

/**
 * Validate that all required images exist for a card
 *
 * @param slug - Card slug
 * @param requiredKeys - Array of required image keys
 * @returns Object with validation result and missing keys
 */
export function validateCardImages(
  slug: string,
  requiredKeys: string[]
): { valid: boolean; missing: string[] } {
  const available = getAvailableImages(slug);
  const missing = requiredKeys.filter(key => !available.includes(key));

  return {
    valid: missing.length === 0,
    missing
  };
}
