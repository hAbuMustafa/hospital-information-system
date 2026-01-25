<script lang="ts">
  import { getTermed } from '$lib/utils/date-format';

  type PropsT = {
    indefinite?: boolean;
    length?: number;
    unifiedSeparators?: boolean;
  };

  let {
    indefinite = false,
    length = 4,
    unifiedSeparators = $bindable(true),
  }: PropsT = $props();
</script>

<span
  class="line"
  class:fading={indefinite}
  style:--period-line-height={unifiedSeparators ? 4 : length}
>
  {#if length}
    <span class="duration">
      ({getTermed(length, 'يوم', 'أيام')})
    </span>
  {/if}
</span>

<style>
  .line {
    width: 2px;
    background: #bdbdbd;
    height: calc(var(--period-line-height) * 10px);

    display: flex;
    flex-direction: column;
    align-items: start;
    justify-content: center;
  }

  .line.fading {
    background: linear-gradient(#fff, 30%, transparent 99% 1%);
    height: 80px;
  }

  .duration {
    margin-inline-start: 1rem;
    direction: rtl;
    vertical-align: middle;

    white-space: nowrap;
  }
</style>
