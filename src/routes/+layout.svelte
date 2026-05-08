<script lang="ts">
	// Global Styling
	import '../app.scss';
	import '../fonts.scss';
	import 'remixicon/fonts/remixicon.css';

	import { onNavigate } from '$app/navigation';
    import { base } from '$app/paths';
	import theme from '$lib/state/theme.svelte';
    import Footer from '$lib/components/Footer.svelte';
    // import decoration1 from "$lib/images/clover-icon.png";
    // import decoration2 from "$lib/images/pink-heart.png";
    import type { Snippet } from 'svelte';
    import { prefersReducedMotion } from 'svelte/motion';
    // import Flash from '$lib/components/Flash.svelte';

    interface Props {
        children: Snippet;
    }

    let { children }: Props = $props();

	$effect(() => {
        theme.mount();
    })

    $effect(() => {
        theme.mountEffects();
	});

	onNavigate((navigation) => {
        if (
            !document.startViewTransition ||
            prefersReducedMotion.current
        ) {
            return;
        }

        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
	});
</script>

{@render children?.()}

<Footer />

<!-- <div class="portal">
	<Flash
		closeable={false}
		id={'grade-wars'}
	>
		<em>Check out the
			<a
				href="{base}/grade-wars"
				onclick={e => e.stopPropagation()}
			>
			Grade Wars leaderboard</a>!
		</em>
	</Flash>
</div> -->

<!-- {#if !prefersReducedMotion.current}
    <div class="flakes">
        {#each Array(20) as _, i}
            <img
                class="flake"
                src={decoration1}
                alt=""
                style={`--x:${Math.random()}; --d:${Math.random() * 10}s;`}
            />
        {/each}
    </div>
{/if} -->

<style lang="scss">
    .flakes {
        pointer-events: none;
        position: fixed;
        inset: 0;
        overflow: hidden;
        z-index: 9999;
    }

    .flake {
        position: absolute;
        width: 24px;
        height: 24px;
        left: calc(var(--x) * 100vw);
        top: -10vh;
        animation: fall 10s linear infinite;
        animation-delay: var(--d);
        opacity: 0.9;
    }

    @keyframes fall {
        0% { transform: translateY(0) translateX(0) rotate(0deg); opacity: 1; }
        20% { transform: translateY(25vh) translateX(5px) rotate(72deg); opacity: 1; }
        40% { transform: translateY(50vh) translateX(-5px) rotate(144deg); opacity: 1; }
        60% { transform: translateY(75vh) translateX(5px) rotate(216deg); opacity: 1; }
        80% { transform: translateY(100vh) translateX(-5px) rotate(288deg); opacity: .7; }
        100% { transform: translateY(125vh) translateX(0) rotate(360deg); opacity: 0; }
    }

    :global {
        @keyframes fade-in {
            from {
                opacity: 0;
            }
        }

        @keyframes fade-out {
            to {
                opacity: 0;
            }
        }

        @keyframes slide-from-right {
            from {
                transform: translateX(20px);
            }
        }

        @keyframes slide-to-left {
            to {
                transform: translateX(-20px);
            }
        }

        :root::view-transition-old(root) {
            animation:
                50ms cubic-bezier(0.4, 0, 1, 1) both fade-out,
                150ms cubic-bezier(0.4, 0, 0.2, 1) both slide-to-left;
        }

        :root::view-transition-new(root) {
            animation:
                120ms cubic-bezier(0, 0, 0.2, 1) 50ms both fade-in,
                150ms cubic-bezier(0.4, 0, 0.2, 1) both slide-from-right;
        }
    }

    /* .portal {
        position: relative;
    } */

    /* em {
        font-weight: bold;
    } */
</style>
