/**
 * Compress an image buffer to WebP format, aiming for a target size.
 * @param buffer - Original image buffer
 * @param targetSizeKB - Target size in KB (e.g., 200)
 * @returns Compressed buffer and metadata
 */
export async function compressThumbnail(
  buffer: Buffer,
  targetSizeKB: number = 200
): Promise<{ buffer: Buffer; size: number; format: string }> {
  try {
    const { default: sharp } = await import('sharp');
    let quality = 80;
    let compressed = await sharp(buffer)
      .webp({ quality })
      .toBuffer();

    // If still too large, reduce quality in a loop
    // But don't go below 10 to maintain some visibility
    while (compressed.length > targetSizeKB * 1024 && quality > 10) {
      quality -= 10;
      compressed = await sharp(buffer)
        .webp({ quality })
        .toBuffer();
    }

    // If still too large, try resizing as a last resort
    if (compressed.length > targetSizeKB * 1024) {
      compressed = await sharp(buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 50 })
        .toBuffer();
    }

    return {
      buffer: compressed,
      size: compressed.length,
      format: 'webp',
    };
  } catch (error) {
    console.error('Image compression error:', error);
    // Fallback to original buffer if compression fails
    return {
      buffer: buffer,
      size: buffer.length,
      format: 'original',
    };
  }
}
