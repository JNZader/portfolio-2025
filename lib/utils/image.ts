import { getPlaiceholder } from 'plaiceholder';

/**
 * Generate blur placeholder for image
 * @param src Image URL
 * @returns Base64 blur data URL
 */
export async function getBlurDataURL(src: string): Promise<string> {
  try {
    const buffer = await fetch(src).then(async (res) => Buffer.from(await res.arrayBuffer()));

    const { base64 } = await getPlaiceholder(buffer, { size: 10 });

    return base64;
  } catch (error) {
    console.error('Error generating blur placeholder:', error);
    // Fallback: solid color
    return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
  }
}
