<script lang="ts">
  /** The calendar component showing school events */
  import theme from "$lib/state/theme.svelte";
  import { quadInOut } from "svelte/easing";
  import { prefersReducedMotion } from "svelte/motion";
  import { fly } from "svelte/transition";
  import CalendarDay from "./CalendarDay.svelte";
  import CalendarDetail from "./CalendarDetail.svelte";

  /// Constants
  const MS_IN_DAY = 1000 * 60 * 60 * 24;

  const DAYS_IN_WEEK = 7;

  const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  /**
   * Represents a mapping of a key to all entries which have this key.
   */
  type Grouping<K, T> = Map<K, T[]>;

  /**
   * Groups the entries in the array using the keyMapper function.
   * Standard 'group by' function, but each item can have multiply identities
   * and can be grouped multiple times under different keys.
   * @param array the items to group
   * @param keyMapper the identity function: assigns a list of keys to each time
   * @returns a grouping of keys to all values that are identified by the key.
   * A value may appear under more than one key.
   */
  function multiGroupBy<K, T>(
    array: T[],
    keyMapper: (obj: T) => K[]
  ): Grouping<K, T> {
    const map: Grouping<K, T> = new Map();

    array.forEach((item) => {
      const keys = keyMapper(item);

      for (const key of keys) {
        const collection = map.get(key) || [];

        collection.push(item);
        map.set(key, collection);
      }
    });

    return map;
  }

  /**
   * Calculates the number of days between two datetimes.
   * @param datetime1 the first datetime
   * @param datetime1 the second datetime
   * @returns the number of days between the dates
   */
  function numDays(datetime1: Date, datetime2: Date) {
    // Removes the time to compare by date only
    const date1 = new Date(datetime1);
    const date2 = new Date(datetime2);

    date1.setHours(0, 0, 0, 0);
    date2.setHours(0, 0, 0, 0);

    return (date2.getTime() - date1.getTime()) / MS_IN_DAY;
  }

  /**
   * Helper function to calculate if a year is a leap year.
   * @param year the year
   * @returns if the year is a leap year
   */
  function isLeapYear(year: number): boolean {
    return (
      (year % 4 === 0 && year % 100 !== 0 && year % 400 !== 0) ||
      (year % 100 === 0 && year % 400 === 0)
    );
  }

  /**
   * Helper function to get the days in February.
   * @param year the year
   * @returns the number of days in February in that year
   */
  function getFebruaryDays(year: number): number {
    return isLeapYear(year) ? 29 : 28;
  }


  interface Props {
    events: SchoolEvent[];
    /** Date which should be visible from the calendar */
    date?: Date;
    selectedDate?: Date | null;
  }

  let { events, date = $bindable(new Date()), selectedDate = $bindable() }: Props = $props();

  const selectDate = (date: Date) => () => (selectedDate = date);

  const eventPriority = (firstEvent: SchoolEvent, secondEvent: SchoolEvent) => {
    const durationDifference =
      (secondEvent.endDate.getTime() - secondEvent.startDate.getTime()) -
      (firstEvent.endDate.getTime() - firstEvent.startDate.getTime());

    return durationDifference ||
      Number(Boolean(firstEvent.isAuxiliary)) - Number(Boolean(secondEvent.isAuxiliary));
  };

  let calendarEvents = $derived(events.toSorted(eventPriority));

  function getEventBarIndex(event: SchoolEvent): number {
    return calendarEvents
      .filter((candidate) =>
        candidate.startDate.toDateString() === event.startDate.toDateString()
      )
      .indexOf(event);
  }

  function getEventBarSegments(event: SchoolEvent) {
    const segments: { row: number; startColumn: number; endColumn: number }[] = [];
    const monthEnd = new Date(year, month + 1, 0);
    let segmentStart = new Date(event.startDate);
    const eventEnd = event.endDate < monthEnd ? event.endDate : monthEnd;

    while (segmentStart <= eventEnd) {
      const row = Math.ceil((segmentStart.getDate() + firstDayOffset) / 7);
      const lastDayOfWeek = row * 7 - firstDayOffset;
      const segmentEnd = new Date(
        year,
        month,
        Math.min(eventEnd.getDate(), lastDayOfWeek)
      );

      segments.push({
        row,
        startColumn: segmentStart.getDay() + 1,
        endColumn: segmentEnd.getDay() + 2
      });

      segmentStart = new Date(segmentEnd);
      segmentStart.setDate(segmentStart.getDate() + 1);
    }

    return segments;
  }

  /** Grouping of events under the day(s) that the are happening */
  let eventsMap = $derived(
    multiGroupBy(events, (event) => {
      const days = Array(numDays(event.startDate, event.endDate) + 1).fill(0);

      const startYear = event.startDate.getFullYear();
      const startMonth = event.startDate.getMonth();
      const startDate = event.startDate.getDate();

      return days.map((_, i) =>
        new Date(startYear, startMonth, startDate + i).toDateString()
      );
    })
  );

  /** Date-derived properties */
  let month = $derived(date.getMonth());
  let year = $derived(date.getFullYear());

  let daysInMonth = $derived([
    31,
    getFebruaryDays(year),
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ]);

  /** Offset of first day */
  let firstDayOffset = $derived(
    new Date(year, month, 1).getDay() % 7
  );
  let rows = $derived(Math.ceil((firstDayOffset + daysInMonth[month]) / 7));
</script>

<div class="calendar">
  <div class="calendar__header">
    <div class="calendar__header__date">
      <button
        onclick={() => (date = new Date(year, month - 1, 1))}
        aria-label="Previous month"
      >
        <i class="ri-arrow-left-s-line"></i>
      </button>
      <h2>{MONTHS[month]} {year}</h2>
      <button
        onclick={() => (date = new Date(year, month + 1, 1))}
        aria-label="Next month"
      >
        <i class="ri-arrow-right-s-line"></i>
      </button>
    </div>
    <div class="calendar__header__days">
      {#each DAYS as day}
        <div>{day}</div>
      {/each}
    </div>
  </div>
  <div
    class="calendar__body"
    class:selected-date={selectedDate}
    class:dark-mode={theme.value === "dark"}
    class:light-mode={theme.value === "light"}
  >
    {#each { length: rows } as _, i}
      <!-- Calculating the offset at the begining and end of the month -->
      {#each { length: DAYS_IN_WEEK } as _, j}
        {@const dayCount = i * DAYS_IN_WEEK + j - firstDayOffset + 1}
        {@const currentDate = new Date(year, month, dayCount)}
        {@const validDate = dayCount > 0 && dayCount <= daysInMonth[month]}

        {#if validDate}
          <CalendarDay
            events={eventsMap.get(currentDate.toDateString())}
            onclick={validDate && selectDate(currentDate)}
          >
            <span class="calendar__body__day">{dayCount}</span>
          </CalendarDay>
        {:else}
          <div></div>
        {/if}
      {/each}
    {/each}
    {#each calendarEvents.toReversed() as event}
      <!-- Calculating where to place the date button using CSS Grid Layout -->
      {@const eventBarIndex = getEventBarIndex(event)}
      {#if eventBarIndex < 3 && event.startDate.getMonth() === month && event.startDate.getFullYear() === year}
        {#each getEventBarSegments(event) as segment}
          <div
            class="calendar__body__event"
            style={`
              grid-row: ${segment.row} / ${segment.row + 1};
              grid-column: ${segment.startColumn} / ${segment.endColumn};
              --event-bar-index: ${eventBarIndex};
              --color-badge: var(--color-badge-${event.type})
            `}
          >
            <div class="text-wrapper">{event.name}</div>
          </div>
        {/each}
      {/if}
    {/each}
    <!-- Calender detail that slides in from the right -->
    <!-- Does not transitions if the user prefers reduced motion -->
    {#if selectedDate}
      <div
        class="calendar-detail"
        transition:fly={{
          x: 250,
          opacity: 1,
          duration: prefersReducedMotion.current ? 0 : 250,
          easing: quadInOut,
        }}
      >
        <CalendarDetail
          date={selectedDate}
          events={(eventsMap.get(selectedDate.toDateString()) || []).toSorted(eventPriority)}
          onclose={() => (selectedDate = null)}
        />
      </div>
    {/if}
  </div>
</div>

<style lang="scss">
  @use "../../../styles/exports.scss" as exports;

  .calendar {
    --calendar-events-font-size: 0.7rem;
    --calendar-heading-font-size: 1.5rem;
    --calendar-day-font-size: 1rem;
    --calendar-week-day-font-size: 1rem;

    --calendar-detail-desciption-font-size: 0.9rem;
    --calendar-detail-event-font-size: 1rem;
    --calendar-detail-date-font-size: 1.25rem;

    --calendar-detail-heading-gap: 0.75rem;
    --calendar-detail-events-gap: 0.5rem;
    --calendar-detail-events-info-gap: 0.1rem;

    overflow: hidden;

    position: relative;

    font-family: "Poppins", sans-serif;

    width: clamp(18rem, 85%, 56rem);
    margin: 0 auto;
    margin-top: 3rem;

    color: var(--color-dark);
    background-color: var(--color-light);

    box-shadow: exports.$box-shadow;
    z-index: 1;
  }

  .calendar__header {
    background-color: var(--color-primary);
    color: var(--color-light-2);

    padding: 1rem 0;

    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: 1.5rem;

    h2 {
      text-transform: uppercase;
      font-size: var(--calendar-heading-font-size);
      width: 13rem;

      font-weight: bold;
    }
  }

  .calendar__body__event {
    position: absolute;

    bottom: calc((2 - var(--event-bar-index)) * 1.2rem);
    left: 0;
    right: 0;
  }

  .text-wrapper {
    width: calc(100% - 0.8rem);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .calendar__header__date {
    display: flex;
    flex-direction: row;
    gap: 0.75rem;
    justify-content: center;
    align-items: center;

    button {
      all: unset;
    }

    h2,
    button {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-self: center;
      text-align: center;
    }

    i {
      position: relative;
      font-size: 2rem;
      z-index: 20;

      &:hover {
        cursor: pointer;
      }

      &:hover::before {
        background-color: var(--color-box-shadow);
        border-radius: 50%;
      }
    }
  }

  .calendar__body__day {
    font-size: var(--calendar-day-font-size);
    transform: translateY(-1.6rem);
  }

  .calendar__header__days {
    display: grid;
    width: 100%;
    grid-template-columns: repeat(7, calc(100% / 7));

    > div {
      display: flex;
      flex-direction: row;
      justify-content: center;
      align-items: center;

      font-size: var(--calendar-week-day-font-size);
    }
  }

  .calendar__body {
    position: relative;
    display: grid;
    grid-template-columns: repeat(7, calc(100% / 7));

    transition: background-color 300ms ease-in-out;

    &.selected-date {
      background-color: var(--color-box-shadow);
    }
  }

  .calendar__body__event {
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    text-align: center;

    border-radius: 4rem;
    padding: 0.125rem;
    margin: 0 0.25rem 0.25rem 0.25rem;

    font-size: var(--calendar-events-font-size);

    background-color: var(--color-badge);
  }

  .calendar-detail {
    position: absolute;
    top: 0;
    bottom: 0;
    right: 0;

    width: 30%;

    z-index: 3;
  }

  @include exports.media-large {
    .calendar {
      --calendar-events-font-size: 0.6rem;
      --calendar-day-font-size: 0.9rem;
      --calendar-week-day-font-size: 0.9rem;

      --calendar-detail-date-font-size: 1.125rem;
      --calendar-detail-description-font-size: 0.85rem;
      --calendar-detail-event-font-size: 0.95rem;

      --calendar-detail-heading-gap: 0.5rem;
      --calendar-detail-events-gap: 0.4rem;
      --calendar-detail-events-info-gap: 0.1rem;
    }

    .calendar-detail {
      width: 35%;
    }
  }

  @include exports.media-medium {
    .calendar {
      --calendar-events-font-size: 0.55rem;
      --calendar-heading-font-size: 1.25rem;
      --calendar-day-font-size: 0.8rem;
      --calendar-week-day-font-size: 0.9rem;

      --calendar-detail-date-font-size: 1rem;
      --calendar-detail-description-font-size: 0.8rem;
      --calendar-detail-event-font-size: 0.9rem;
    }

    .calendar__header {
      gap: 0.75rem;
      padding: 0.75rem 0.25rem;
    }

    .calendar-detail {
      width: 42%;
    }

    .calendar__header h2 {
      width: 11rem;
    }
  }

  @include exports.media-small {
    .calendar__body__event {
      display: none;
    }

    .calendar-detail {
      width: 50%;
    }
  }

  @include exports.media-smallest {
    .calendar-detail {
      width: 100%;
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .calendar__body {
      transition: none;
    }
  }
</style>
