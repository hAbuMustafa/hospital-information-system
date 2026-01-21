<script lang="ts">
  import { goto } from '$app/navigation';
  import Sheet from '$lib/components/Sheet/Sheet.svelte';
  import { getTermed } from '$lib/utils/date-format';
  import type { inPatient_view } from '$server/db/schema/entities/patients';

  let { data } = $props();
  let patientsByWard = Object.groupBy(
    data.patients,
    (p: typeof inPatient_view.$inferSelect) => p.ward_name
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
      rows={patientsByWard[ward_name]!.map((p) => {
        const {
          ward_name,
          first_name,
          father_name,
          grandfather_name,
          family_name,
          id_doc_type_id,
          meal_type,
          recent_ward_id,
          ward_floor,
          ward_tags,
          security_status,
          admitted_from,
          discharge_notes,
          discharge_order_id,
          discharge_reason,
          discharge_time,
          person_id,
          id_doc_number,
          id_doc_type,
          birthdate,
          health_insurance,
          gender,
          patient_file_number,
          ...rest
        } = p;
        return rest;
      })}
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
    />
  {/if}
{/each}

<style>
  h2 {
    display: flex;
    justify-content: space-around;

    @media print {
      break-after: avoid;
    }
  }
</style>
