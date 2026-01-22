<script lang="ts">
  import Event from './Event.svelte';
  import Line from './Line.svelte';

  type PropsT = {
    events: any[];

    eventTitle_name: string;
    eventTime_name: string;
    endEvent_label?: string;
    endEvent_time?: Date | null;

    alternate?: boolean;

    dateTimeFormatter?: Function;
  };

  const {
    events,
    eventTitle_name,
    eventTime_name,
    endEvent_time,
    endEvent_label,
    alternate = true,
    dateTimeFormatter,
  }: PropsT = $props();
</script>

<div class="timeline">
  {#each events as event, i (i)}
    <Event
      eventTitle={event[eventTitle_name]}
      eventTime={event[eventTime_name]}
      direction={alternate ? i % 2 === 0 : true}
      {dateTimeFormatter}
    />
    <Line indefinite={i === events.length - 1 && !endEvent_time} />
  {/each}

  {#if endEvent_time}
    <Event
      eventTitle={endEvent_label ?? events.at(-1)[eventTitle_name]}
      eventTime={endEvent_time}
      direction={alternate ? events.length % 2 === 0 : true}
      isEndEvent={true}
      {dateTimeFormatter}
    />
  {/if}
</div>

<style>
  .timeline {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0.5rem 1rem;
    flex-grow: 1;
    gap: 0.25rem;
  }
</style>
