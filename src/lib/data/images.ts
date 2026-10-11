import type { ImageProps, ImagePropsWithHeight } from "$lib/types/image.types";
import type { ImageMeta } from "$lib/types/image.types";
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
		w: '800;1600',
		rotate: '0',
		as: 'picture',
	}
})

type Orientation = 'horizontal' | 'vertical';

/** 
 * Determines if the image has been rotated by a multiple of 90 degrees 
 * such that the orientation of the image has changed.
 * i.e. it has been rotated by 90 + 180n degrees, where n is an integer.
 * @param img the image to determine correct orientation for.
 * @returns if the image is rotated such that its orientation has changed
 */

/**
 * @param maxResults the maximum size of the response set or undefined if no limit is specified
 * @param orientation allows filtering my image orientation
 * @param useDPR use DPR for responsive images
 * @param reverse if the result order should be reversed
 */
interface GetGalleryImagesParams {
	maxResults?: number;
	orientation?: Orientation;
	useDPR?: boolean;
	reverse?: boolean;
	numericalSort?: boolean;
}

/**
 * Reads image names from static folder and transforms them into image URLs
 * @param params parameters that can be used to modify this function's behaviour
 * @returns an array of ImageMeta objects
 */
const getGalleryImages = async (params: GetGalleryImagesParams = {}) => {

	const filepaths = (await Promise.all(
			Object.entries(files).map(async ([filepath, value]) => ([path.basename(filepath), await value() as any]))
		))
		.map(([filename, image]) => {

			const sources = (image.sources as ({
				[key: string]: ImageProps[] | { srcset?: string } | string;
			}));


			if (params.useDPR) {
				Object.entries(sources).forEach(([, source]) => {
					if (Array.isArray(source)) {
						source.forEach((prop, i) => (prop.dpr = i + 1));
					}
				});
			}

			return {
				filename: filename,
				img: {...(image.img as ImagePropsWithHeight)}, // Make copy bc the dimensions of this object are somehow stateful?? Maybe the file objects are cached.
				sources: sources,
				
			} as unknown as ImageMeta & { filename: string }
		});

	if (params.numericalSort) {
		filepaths.sort((a, b) => parseInt(a.filename, 10) - parseInt(b.filename, 10));
	}

	if (params.reverse) {
		filepaths.reverse();
	}

	let filteredFilepaths = filepaths;
	
	filteredFilepaths = filteredFilepaths.slice(0, params.maxResults);

	if (params.orientation === 'horizontal') {
		filteredFilepaths = filteredFilepaths.filter(img => img.img.w > img.img.h);
	}

	if (params.orientation === 'vertical') {
		filteredFilepaths = filteredFilepaths.filter(img => img.img.h > img.img.w);
	}
	
	return filteredFilepaths;
}

export default getGalleryImages;