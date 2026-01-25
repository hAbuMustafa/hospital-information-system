<script lang="ts">
  import { getTermed } from '$lib/utils/date-format';

  type PropsT = {
    eventTitle: string;
    eventTime: Date;

    direction: boolean;

    isEndEvent?: boolean;

    duration?: number;

    dateTimeFormatter?: Function;
  };

  let {
    eventTitle,
    eventTime,
    direction = true,
    isEndEvent = false,
    duration,
    dateTimeFormatter,
  }: PropsT = $props();
</script>

<div class="event-wrapper" class:reversed={direction}>
  <span
    class="event-title"
    title={duration ? `المدة ${getTermed(duration, 'يوم', 'أيام')}` : null}
    >{eventTitle}</span
  >
  <span class="dot" class:end={isEndEvent}></span>
  <small class="event-time">{dateTimeFormatter?.(eventTime) ?? eventTime}</small>
</div>

<style>
  .event-wrapper {
    width: 100%;
    gap: 1rem;
    align-items: center;

    display: grid;
    grid-template-columns: 48% 4px 48%;
    grid-template-areas: 's dot e';
  }

  .event-title {
    font-weight: bolder;
    font-size: 1.25rem;

    justify-self: end;
    grid-area: s;

    .reversed & {
      justify-self: start;
      grid-area: e;
    }
  }

  span,
  small {
    white-space: nowrap;
  }

  .dot {
    background-color: #7cd5e2;
    padding: 0.25rem;
    width: 0.25rem;
    height: 0.25rem;
    border: var(--main-border);
    border-radius: 50%;
    justify-self: center;
  }

  .dot.end {
    background-color: red;
  }

  .event-time {
    color: gray;

    justify-self: start;
    grid-area: e;

    .reversed & {
      justify-self: end;
      grid-area: s;
    }
  }
</style>
