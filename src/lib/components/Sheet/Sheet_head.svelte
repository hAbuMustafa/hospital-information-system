<script lang="ts">
  import { getContext } from 'svelte';

  const columnNames: () => string[] = getContext('column names');
  const renameColumns: () => Record<string, string> = getContext('rename columns');
  const actionColumns: () => Record<
    string,
    {
      actionName: string;
      onclick: Function;
      style?: { color?: string; backgroundColor?: string };
    }
  > = getContext('action columns');
  const actionColumnNames = actionColumns?.() ? Object.keys(actionColumns?.()) : [];
</script>

<thead>
  <tr>
    {#each columnNames() as colName, i (i)}
      <th class:action_column={actionColumnNames.includes(colName)}>
        {renameColumns() && renameColumns().hasOwnProperty(colName)
          ? renameColumns()[colName]
          : colName}
      </th>
    {/each}
  </tr>
</thead>

<style>
  thead {
    position: sticky;
    inset-block-start: 0;
  }

  tr {
    background-color: hsl(from var(--main-bg-color) h s 60%);
    color: var(--main-bg-color);
    border: var(--main-border);
  }

  th {
    padding: 0.5rem;
    text-align: center;

    &.action_column {
      @media print {
        display: none;
      }
    }
  }

  th:not(:last-of-type) {
    border-inline-end: var(--main-border);
  }
</style>
