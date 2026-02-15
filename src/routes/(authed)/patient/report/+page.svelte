<script lang="ts">
  import { goto } from '$app/navigation';
  import Sheet from '$lib/components/Sheet/Sheet.svelte';
  import { getTermed } from '$lib/utils/date-format';
  import type { inPatient_view } from '$server/db/schema/entities/patients';

  let { data } = $props();
  let patientsByWard = $derived(
    Object.groupBy(data.patients, (p: typeof inPatient_view.$inferSelect) => p.ward_name),
  );
</script>

{#each data.wards.map((w) => w.name) as ward_name, i (i)}
  {#if patientsByWard[ward_name]}
    {@const currWard = data.wards.find((w) => w.name === ward_name)!}
    {@const wardOccupiedBeds = patientsByWard[ward_name].length}
    {@const wardOccupationRatio = wardOccupiedBeds / currWard.capacity}
    {@const progressColor =
      wardOccupationRatio < 0.5 ? 'green' : wardOccupationRatio < 0.8 ? 'orange' : 'red'}
    <h2 id={currWard.id.toString()}>
      <span>
        {currWard.name}
      </span>
      <span>
        {getTermed(wardOccupiedBeds, 'مريض', 'مرضى')}
        <progress value={wardOccupationRatio} style="accent-color: {progressColor};"
        ></progress>
        {getTermed(currWard.capacity, 'سرير', 'أسرَّة')}
      </span>
    </h2>
    <Sheet
      rows={patientsByWard[ward_name]}
      pickColumns={[
        'patient_id',
        'patient_file_number',
        'full_name',
        'admission_time',
        'admission_notes',
      ]}
      dateColumns={{ admission_time: 'YYYY/MM/DD' }}
      renameColumns={{
        admission_time: 'تاريخ الدخول',
        admission_notes: 'ملاحظات',
        patient_file_number: 'رقم الملف',
        patient_id: 'قيد الإقامة',
        full_name: 'اسم المريض',
        diagnosis: 'التشخيص',
        discharge: 'خروج',
        transfer: 'تحويل',
      }}
      actionColumns={{
        transfer: {
          actionName: 'تحويل',
          onclick: function (p: typeof inPatient_view.$inferSelect) {
            goto(`/patient/transfer?patient_id=${p.patient_id}`);
          },
          style: {
            color: 'var(--main-bg-color)',
            backgroundColor: 'orange',
          },
        },
        discharge: {
          actionName: 'خروج',
          onclick: function (p: typeof inPatient_view.$inferSelect) {
            goto(`/patient/discharge?patient_id=${p.patient_id}`);
          },
          style: {
            backgroundColor: 'light-dark(salmon, maroon)',
          },
        },
      }}
      detailsColumn={{
        patient_id: (p: typeof inPatient_view.$inferSelect) => `/patient/${p.patient_id}`,
      }}
      topOffset="1.75rem"
    />
  {/if}
{/each}

<style>
  h2 {
    display: flex;
    justify-content: space-around;
    position: sticky;
    inset-block-start: 0;
    background-color: var(--main-bg-color);

    @media print {
      break-after: avoid;
    }
  }
</style>
