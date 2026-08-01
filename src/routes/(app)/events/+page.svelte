<script lang="ts">
    import { page } from "$app/state";
    import Calendar from "$lib/components/Calendar/Calendar.svelte";
    import HomePageEvent from "$lib/components/HomePageEvent.svelte";
    import Metadata from "$lib/components/Metadata.svelte";
    import { pushStateWithQuery } from "$lib/util/replaceStateWithQuery";
    import { onMount } from "svelte";
    import Leaderboard from "$lib/components/Leaderboard/Leaderboard.svelte";
    import { base } from "$app/paths";
    import type { PageServerData } from "./$types";

    interface Props {
        data: PageServerData;
    }

    let { data }: Props = $props();

    let monthEvents = $state<SchoolEvent[]>(calculateMonthEvents());

    function calculateMonthEvents() {
        const seen = new Set<string>();
        const now = new Date();

        return data.events
            .filter(e =>
                e.startDate.getMonth() === now.getMonth() &&
                e.startDate.getFullYear() === now.getFullYear() &&
                !seen.has(e.name) && seen.add(e.name)
            );
    }

    let selectedDate = $state<Date | null>();

    // Do not push state on initial load
    let initialLoad = true;

    onMount(() => {
        if (page.url.searchParams.has("date")) {
            const dateStringFragments = page.url.searchParams.get("date")!.split("-")
            selectedDate = new Date(+dateStringFragments[0], +dateStringFragments[1] - 1, +dateStringFragments[2]);
            initialLoad = true;
        }
    });


    $effect(() => {
        // Router not initialized yet
        if (selectedDate === undefined || initialLoad) {
            initialLoad = false;
            return;
        }

        if (selectedDate === null) {
            pushStateWithQuery({
                date: null,
            });
            return;
        }

        pushStateWithQuery({
            date: `${selectedDate.getFullYear()}-${selectedDate.getMonth() + 1}-${selectedDate.getDate()}`,
        });
    });

    const TITLE = "Events | RHHS StuCo";
    const DESCRIPTION = "Stay up to date on all school events here!";
</script>

<Metadata
title={TITLE}
description={DESCRIPTION}
url="https://rhhsstuco.ca/events"
/>

<main>
    <h1>Events</h1>
    <Calendar events={data.events} bind:selectedDate />
    <section class="month-events">
        <h2>Events This Month</h2>
        <div class="events__list">
        {#if monthEvents.length === 0}
            <h3 class="events__list-no-events">No Events This Month</h3>
        {/if}
        {#each monthEvents as event}
            <HomePageEvent {event} />
        {/each}
        </div>
    </section>
    <!--
    <section class="leaderboard">
        <h2><a href="{base}/grade-wars">Grade Wars Leaderboard</a></h2>
        <Leaderboard gradeColors={data.standings.rankings} gradePoints={data.standings.gradePoints}/>
    </section>
    -->
</main>

<style lang="scss">
    @use "../../../styles/exports.scss" as exports;

    main {
        min-height: calc(100vh - 5.5rem);
        margin-bottom: 8rem;
    }

    h1 {
        margin-top: 2rem;
        @include exports.header;
    }

    h2 {
        margin-top: 3rem;
        @include exports.header($font-size: calc(var(--font-size-header) - 1rem));
    }

    .events__list-no-events {
        @include exports.not-found-message;
    }

    .month-events {
        font-family: "Poppins", sans-serif;

        width: clamp(32rem, 60%, 48rem);
        margin: 0 auto;

        display: flex;
        flex-direction: column;
        gap: 4rem;

        padding: 5rem 0;

        .events__list {
            display: flex;
            flex-direction: column;
            gap: 2rem;
        }
    }

    .leaderboard {
		display: flex;
		flex-direction: column;
		gap: 2.5rem;
		width: clamp(18rem, 85%, 52rem);
		margin: 0 auto;

        a {
            all: unset;
            text-decoration: underline;

            &:hover {
                cursor: pointer;
            }
        }
    }

    @include exports.media-large {
        .month-events {
            --event-day-font-size: 2.5rem;
            --event-month-font-size: 1.125rem;
            --event-title-font-size: 1.75rem;
            --event-description-font-size: 1.05rem;
        }
    }

    @include exports.media-small {
        .month-events {
            width: clamp(16rem, 80%, 42rem);

            --event-day-font-size: 2.25rem;
            --event-month-font-size: 1rem;
            --event-title-font-size: 1.5rem;
            --event-description-font-size: 0.95rem;
        }

        h2 {
            margin-top: 1rem;
            @include exports.header(
                $font-size: calc(var(--font-size-header) - 0.75rem)
            );
        }
    }

    @include exports.media-smallest {
        .month-events {
            --event-day-font-size: 2rem;
            --event-month-font-size: 0.9rem;
            --event-title-font-size: 1.25rem;
            --event-description-font-size: 0.85rem;
        }
    }
</style>
