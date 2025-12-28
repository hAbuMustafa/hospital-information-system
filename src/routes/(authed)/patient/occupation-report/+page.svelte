<script lang="ts">
  import { formatDate } from '$lib/utils/date-format';

  let { data } = $props();

  let patientsByWard = Object.groupBy(
    data.patients,
    (p: Record<string, any>) => p.recent_ward
  );
</script>

<h2>{formatDate(new Date(), 'ليوم YYYY/MM/DD الساعة hh:mm')}</h2>
<table>
  <colgroup>
    <col class="name" />
    <col class="number" />
    <col class="number" />
    <col class="number" />
  </colgroup>
  <thead>
    <tr>
      <th>القسم</th>
      <th>عدد الأسرة</th>
      <th>المشغول</th>
      <th>الشاغر</th>
    </tr>
  </thead>

  <tbody>
    {#each data.wards as ward, i (i)}
      {@const wardOccupiedBeds = patientsByWard[ward.id]?.length ?? 0}
      <tr class:out_of_service={!ward.capacity}>
        <th>{ward.name}</th>
        <td>{ward.capacity}</td>
        <td>{wardOccupiedBeds}</td>
        <td>{ward.capacity - wardOccupiedBeds}</td>
      </tr>
    {/each}
  </tbody>
</table>

<style>
  h2 {
    text-align: center;
  }

  table {
    max-width: 100vw;
    border-collapse: collapse;

    white-space: nowrap;
  }

  thead > tr,
  col.name {
    background-color: hsl(from var(--main-bg-color) h s 60%);
    border: var(--main-border);
  }

  col.number {
    width: 10vw;
  }

  th {
    padding: 0.5rem;
    text-align: center;
    color: var(--main-bg-color);

    border: var(--main-border);
  }

  tbody {
    tr {
      border: var(--main-border);
      transition:
        transform 0.2s ease-in-out,
        background-color 0.5s ease-in-out;
    }

    tr:is(:hover, :focus-within, :active):not(.out_of_service) {
      background-color: light-dark(
        hsl(from var(--main-bg-color) h s 80%),
        hsl(from var(--main-bg-color) h s 30%)
      );
      transform: scale(1.03);
    }
  }

  td {
    border: var(--main-border);
    padding: 0.5rem;
    text-align: center;
    text-wrap: wrap;
  }

  .out_of_service {
    display: none;
  }
</style>
