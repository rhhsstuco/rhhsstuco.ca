export interface ImageProps {
	src: string;
	w?: number;
	h?: number;
	dpr?: number;
};

export type ImagePropsWithHeight = ImageProps & { h?: number };

export type ImageMeta = {
	img: ImagePropsWithHeight;
	sources?: { [key: string]: ImageProps[] | { srcset?: string } | string };
};