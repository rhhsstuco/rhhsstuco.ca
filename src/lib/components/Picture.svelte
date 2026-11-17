<script lang="ts">
	/** <picture> wrapper for images processed by vite-imagetools */

	import type { ImageMeta } from '../types/image.types';

	interface Props {
		meta: ImageMeta;
		sizes?: string;
		alt?: string;
		loading?: 'lazy' | 'eager' | null | undefined;
	}

	let {
		meta,
		sizes = '(max-width: 600px) 800px, (max-width: 1200px) 1600px, 2400px',
		alt = '',
		loading = 'eager'
	}: Props = $props();
	let sources = $derived(meta.sources ?? {});
	let fallback = $derived(meta.img ?? { src: '', w: 0, h: 0 });

	const buildSrcset = (srcMeta: unknown) => {
		if (Array.isArray(srcMeta)) {
			return srcMeta
				.map((meta) => {
					if (meta.dpr) {
						return `${meta.src} ${meta.dpr}x`;
					}

					return `${meta.src} ${meta.w}w`;
				})
				.join(', ');
		}

		if (typeof srcMeta === 'string') {
			return srcMeta;
		}

		if (srcMeta && typeof srcMeta === 'object' && 'srcset' in srcMeta && typeof (srcMeta as { srcset?: string }).srcset === 'string') {
			return (srcMeta as { srcset?: string }).srcset || '';
		}

		return '';
	};
</script>

<picture>
	{#each Object.entries(sources) as [type, srcMeta]}
		{@const srcset = buildSrcset(srcMeta)}
		{#if srcset}
		<source
			type="image/{type}"
			{sizes}
			srcset={srcset}
		/>
		{/if}
	{/each}
	<img src={fallback.src ?? ''} {alt} {loading} width={fallback.w ?? 0} height={fallback.h ?? 0}/>
</picture>

<style lang="scss">
	picture {
		width: 100%;
		height: 100%;
		object-fit: contain;
		display: inline-block;		
	}

    img, source {
		width: 100%;
		height: 100%; 
		object-fit: cover;
		overflow: hidden;
    }
</style>