import type { ImageMeta, ImageProps, ImagePropsWithHeight } from "$lib/types/image.types";
import * as path from 'path';

/*
 * Final render size is currently capped at 1600px.
 * HOWEVER, all source images should always be stored at 2400px.
 * This is because future devices may handle higher-res output.
 * Keeping 2400px originals prevents quality loss if we re-enable it.
 * By 2028, webp can be removed as all browsers should support avif by then.
 * Other upcoming file formats like JPEG XL should be considered in the future.
 * Use https://bulkresizephotos.com/en to resize photos en masse.
 */
const files = import.meta.glob("$images/gallery/*.{jpg,png,webp,avif}", {
	query: {
		format: 'avif;webp',
		w: '800;1600;2400',
		rotate: '0',
		as: 'picture',
	}
});

type Orientation = 'horizontal' | 'vertical';

interface GetGalleryImagesParams {
	maxResults?: number;
	orientation?: Orientation;
	useDPR?: boolean;
	reverse?: boolean;
	numericalSort?: boolean;
}

const withSafeImageMeta = (image: any, filename: string) => {
	const sources = image?.sources as { [key: string]: ImageProps[] | { srcset?: string } | string } | undefined;
	const img = (image?.img ?? {}) as ImagePropsWithHeight;

	if (img && typeof img === 'object' && typeof img.src === 'string' && !img.w) {
		img.w = 0;
	}

	if (sources) {
		Object.entries(sources).forEach(([, source]) => {
			if (Array.isArray(source)) {
				source.forEach((prop) => {
					if (typeof prop.src === 'string' && !prop.w) {
						prop.w = 0;
					}
				});
			}
		});
	}

	return {
		filename,
		img: { ...img },
		sources,
	} as ImageMeta & { filename: string };
};

const getGalleryImages = async (params: GetGalleryImagesParams = {}) => {
	let entries = Object.entries(files);

	if (params.numericalSort) {
		entries.sort((a, b) => parseInt(path.basename(a[0]), 10) - parseInt(path.basename(b[0]), 10));
	}

	if (params.reverse) {
		entries.reverse();
	}

	if (params.maxResults !== undefined) {
		entries = entries.slice(0, params.maxResults);
	}

	const filepaths = (await Promise.all(
		entries.map(async ([filepath, value]) => {
			const image = await value();
			return [path.basename(filepath), image] as const;
		})
	)).map(([filename, image]) => {
		const normalized = withSafeImageMeta(image, filename);

		if (params.useDPR) {
			Object.entries(normalized.sources ?? {}).forEach(([, source]) => {
				if (Array.isArray(source)) {
					source.forEach((prop, i) => (prop.dpr = i + 1));
				}
			});
		}

		return normalized;
	});

	if (params.orientation === 'horizontal') {
		return filepaths.filter((img) => (img.img.w ?? 0) > (img.img.h ?? 0));
	}

	if (params.orientation === 'vertical') {
		return filepaths.filter((img) => (img.img.h ?? 0) > (img.img.w ?? 0));
	}

	return filepaths;
};

export default getGalleryImages;