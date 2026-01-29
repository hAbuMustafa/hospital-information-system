<script lang="ts">
  import { formatDate } from '$lib/utils/date-format';
  import { getContext } from 'svelte';

  type PropsT = {
    dataTuple: [string, string | number | boolean | Date | null | undefined];
    row: Record<string, string | number | boolean | Date | null | undefined>;
  };

  const { dataTuple, row }: PropsT = $props();
  const [colName, colValue] = $derived(dataTuple);

  const dateColumns: () => Record<string, string | undefined> =
    getContext('date columns');
  const detailsColumn: () => Record<string, Function> = getContext('details column');
  const actionColumns: () => Record<
    string,
    {
      actionName: string;
      onclick: Function;
      style?: { color?: string; backgroundColor?: string };
    }
  > = getContext('action columns');
</script>

<td>
  {#if dateColumns() && dateColumns().hasOwnProperty(colName) && colValue}
    {formatDate(colValue as number | Date, dateColumns()[colName])}
  {:else if actionColumns?.() && actionColumns?.().hasOwnProperty(colName)}
    <input
      type="button"
      onclick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        actionColumns?.()[colName].onclick(row);
      }}
      value={actionColumns?.()[colName].actionName}
      style:--color={actionColumns?.()[colName].style?.color ?? 'var(--main-text-color)'}
      style:--background-color={actionColumns?.()[colName].style?.backgroundColor ??
        'var(--main-bg-color)'}
    />
  {:else if detailsColumn() && detailsColumn().hasOwnProperty(colName)}
    <a href={detailsColumn()[colName](row)} class="button">{colValue}</a>
  {:else}
    {colValue}
  {/if}
</td>

<style>
  td {
    border: var(--main-border);
    padding: 0.5rem;
    text-align: center;
    text-wrap: wrap;

    &:has(input[type='button']) {
      @media print {
        display: none;
      }
    }
  }

  input[type='button'] {
    font-size: 1rem;
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    position: static;

    background-color: var(--background-color);
    color: var(--color);

    &:is(:hover, :focus) {
      background-color: hsl(from var(--background-color) h 150% l);
    }

    &:active {
      background-color: hsl(from var(--background-color) h 70% l);
    }
  }

  a.button {
    display: inline-block;
    width: 80%;

    @media print {
      all: unset;
    }
  }
</style>
