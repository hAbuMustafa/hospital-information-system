<script lang="ts">
  import { formatDate } from '$lib/utils/date-format';

  const { data } = $props();

  const icuBedCount = data.wards.reduce(
    (total, currentWard) => total + currentWard.capacity,
    0
  );

  let totalVents = $state('12');
  let totalWorkingVents = $state('12');
  let totalUsedVents = $state('12');
</script>

<h2>{formatDate(new Date(), 'ليوم YYYY/MM/DD الساعة hh:mm')}</h2>
<div class="tables-wrapper">
  <table>
    <thead>
      <tr>
        <th colspan="3">الأسرة</th>
        <th colspan="4">أجهزة التنفس الصناعي</th>
      </tr>
      <tr>
        <th>إجمالي</th>
        <th>مشغول</th>
        <th>فارغ</th>
        <th>إجمالي</th>
        <th>يعمل</th>
        <th>مشغول</th>
        <th>فارغ</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>{icuBedCount}</td>
        <td>{data.patients.length}</td>
        <td>{icuBedCount - data.patients.length}</td>
        <td contenteditable bind:textContent={totalVents}></td>
        <td contenteditable bind:textContent={totalWorkingVents}></td>
        <td contenteditable bind:textContent={totalUsedVents}></td>
        <td>{Number(totalWorkingVents) - Number(totalUsedVents)}</td>
      </tr>
    </tbody>
  </table>

  <table>
    <thead>
      <tr>
        <th>اسم الطبيب</th>
        <th>رقم الموبايل</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td contenteditable> د.</td>
        <td contenteditable> </td>
      </tr>
      <tr>
        <td contenteditable> د.</td>
        <td contenteditable> </td>
      </tr>
    </tbody>
  </table>

  <table>
    <thead>
      <tr>
        <th>اسم المريض</th>
      </tr>
    </thead>

    <tbody>
      {#each data.patients as patient, i (i)}
        <tr>
          <td>{patient.full_name}</td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>

<style>
  .tables-wrapper {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  h2 {
    text-align: center;
  }

  table {
    border-collapse: collapse;

    max-width: 80vw;

    td,
    th {
      border: var(--main-border);
      padding: 0.25rem;
    }

    th {
      background-color: hsl(from var(--main-bg-color) h s 60%);
      color: var(--main-bg-color);
    }

    td {
      text-align: center;
    }
  }
</style>
