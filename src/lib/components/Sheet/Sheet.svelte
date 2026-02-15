<script lang="ts">
  import { setContext } from 'svelte';

  import SheetHead from '$lib/components/Sheet/Sheet_head.svelte';
  import Row from '$lib/components/Sheet/Sheet_row.svelte';
  import NoData from '$lib/components/Sheet/Sheet_no_data.svelte';

  type RowT = Record<string, string | number | boolean | Date | null | undefined>;

  type PropsT = {
    rows: RowT[];
    dateColumns?: Record<string, string | undefined>;
    renameColumns?: Record<string, string>;
    detailsColumn?: Record<string, Function>;
    actionColumns?: Record<
      string,
      {
        actionName: string;
        onclick: Function;
        style?: { color?: string; backgroundColor?: string };
      }
    >;
    pickColumns?: string[];
    topOffset?: string;
  };

  const {
    rows,
    dateColumns,
    renameColumns,
    actionColumns,
    detailsColumn,
    pickColumns,
    topOffset,
  }: PropsT = $props();

  function getRows() {
    return rows;
  }

  function getActionColumns() {
    return actionColumns;
  }

  function getDateColumns() {
    return dateColumns;
  }

  function getDetailsColumn() {
    return detailsColumn;
  }

  function getRenamedColumn() {
    return renameColumns;
  }

  function getPickedColumns() {
    return [pickColumns || columnNames, actionColumns ? Object.keys(actionColumns) : null]
      .filter(Boolean)
      .flat();
  }

  let columnNames: string[] = $state([]);
  if (getRows() && getRows().length > 0 && typeof getRows()[0] === 'object') {
    columnNames.push(
      ...Array.from(
        new Set(
          getRows()
            .map((r) => Object.keys(r))
            .flat(),
        ),
      ),
    );
    if (getActionColumns()) {
      columnNames.push(...Object.keys(getActionColumns()!));
    }
  }

  setContext('column names', getPickedColumns);
  if (getDateColumns()) setContext('date columns', getDateColumns);
  if (getRenamedColumn()) setContext('rename columns', getRenamedColumn);
  if (getActionColumns()) setContext('action columns', getActionColumns);
  if (getDetailsColumn()) setContext('details column', getDetailsColumn);
</script>

<table style:--top-offset={topOffset ?? null}>
  {#if columnNames.length === 0}
    <tbody>
      <NoData />
    </tbody>
  {:else}
    <SheetHead />
    <tbody>
      {#each getRows() as row, i (i)}
        <Row dataObj={row} />
      {/each}
    </tbody>
  {/if}
</table>

<style>
  table {
    max-width: 100vw;
    border-collapse: collapse;

    white-space: nowrap;
  }
</style>
