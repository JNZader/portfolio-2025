import createImageUrlBuilder from '@sanity/image-url';
import type { Image } from 'sanity';
import { dataset, projectId } from '../env';

/**
 * Image URL builder
 * Genera URLs optimizadas para imágenes de Sanity
 */
const imageBuilder = createImageUrlBuilder({
    projectId,
    dataset,
});

/**
 * Helper para generar URLs de imágenes
 *
 * @example
 * urlForImage(post.mainImage).width(800).height(600).url()
 */
export const urlForImage = (source: Image | undefined) => {
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

    let builder = urlForImage(source).width(width);

    if (height) {
        builder = builder.height(height);
    }

    return builder.url();
}

/**
 * Helper para generar blur placeholder
 */
export function getImageBlurUrl(source: Image | undefined): string {
    if (!source) return '';

    return urlForImage(source).width(20).quality(20).blur(50).url();
}