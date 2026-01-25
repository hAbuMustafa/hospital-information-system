<script lang="ts">
  import { getDuration } from '$lib/utils/date-format';
  import Event from './Event.svelte';
  import Line from './Line.svelte';
  import { Maximize2, Minimize2 } from '@lucide/svelte';

  type PropsT = {
    events: any[];

    eventTitle_name: string;
    eventTime_name: string;
    endEvent_label?: string;
    endEvent_time?: Date | null;

    alternate?: boolean;

    dateTimeFormatter?: Function;

    unifiedSeparators?: boolean;
  };

  let {
    events,
    eventTitle_name,
    eventTime_name,
    endEvent_time,
    endEvent_label,
    alternate = true,
    dateTimeFormatter,
    unifiedSeparators = $bindable(true),
  }: PropsT = $props();

  const periodLengths = $derived(
    [...events.map((ev) => ev.timestamp), endEvent_time].map((evTime, indx, arr) =>
      getDuration(evTime, arr.at(indx + 1) ?? new Date()),
    ),
  );
</script>

<div class="timeline-wrapper">
  {#if events.length > 1}
    <div class="toggle-wrapper">
      <label
        for="toggle-timeline-length"
        title={unifiedSeparators ? 'إطالة الخطوط نسبيا' : 'توحيد طول الخطوط'}
      >
        {#if unifiedSeparators}
          <Maximize2 />
        {:else}
          <Minimize2 />
        {/if}
      </label>
      <input
        type="checkbox"
        id="toggle-timeline-length"
        bind:checked={unifiedSeparators}
      />
    </div>
  {/if}
  <div class="timeline">
    {#each events as event, i (i)}
      <Event
        eventTitle={event[eventTitle_name]}
        eventTime={event[eventTime_name]}
        direction={alternate ? i % 2 === 1 : true}
        duration={periodLengths[i]}
        {dateTimeFormatter}
      />
      <Line
        indefinite={i === events.length - 1 && !endEvent_time}
        length={periodLengths[i]}
        bind:unifiedSeparators
      />
    {/each}

    {#if endEvent_time}
      <Event
        eventTitle={endEvent_label ?? events.at(-1)[eventTitle_name]}
        eventTime={endEvent_time}
        direction={alternate ? events.length % 2 === 1 : false}
        isEndEvent={true}
        {dateTimeFormatter}
      />
    {/if}
  </div>
</div>

<style>
  .timeline-wrapper {
    position: relative;

    .toggle-wrapper {
      position: sticky;
      inset-block-start: rem;
    }
  }

  .timeline {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 1rem;
    flex-grow: 1;
    gap: 0.25rem;
  }
</style>
