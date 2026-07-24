import { createImageUrlBuilder } from '@sanity/image-url';
import type { Image } from 'sanity';
import { dataset, isSanityConfigured, projectId } from '../env';

/**
 * Image URL builder
 * Genera URLs optimizadas para imágenes de Sanity
 *
 * `null` cuando falta la config de Sanity (V-01): el módulo debe evaluar sin
 * env vars para que las páginas públicas degraden en vez de crashear.
 */
const imageBuilder = isSanityConfigured
    ? createImageUrlBuilder({
          projectId,
          dataset,
      })
    : null;

/**
 * Helper para generar URLs de imágenes
 * Devuelve `null` cuando Sanity no está configurado.
 *
 * @example
 * urlForImage(post.mainImage)?.width(800).height(600).url()
 */
export const urlForImage = (source: Image | undefined) => {
    if (!imageBuilder) return null;
    if (!source?.asset?._ref) {
        return imageBuilder.image({
            _type: 'image',
            asset: {
                _type: 'reference',
                _ref: '',
            },
        });
    }

    return imageBuilder.image(source).auto('format').fit('max');
};

/**
 * Helper para generar URLs con dimensiones específicas
 */
export function getImageUrl(
    source: Image | undefined,
    width: number,
    height?: number
): string {
    if (!source) return '';

    const builder = urlForImage(source)?.width(width);
    if (!builder) return '';

    return (height ? builder.height(height) : builder).url();
}

/**
 * Helper para generar blur placeholder
 */
export function getImageBlurUrl(source: Image | undefined): string {
    if (!source) return '';

    return urlForImage(source)?.width(20).quality(20).blur(50).url() ?? '';
}