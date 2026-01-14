<script lang="ts">
  import { formatDate } from '$lib/utils/date-format';
  import type { inPatient_view } from '$server/db/schema/entities/patients';

  type PropsT = {
    patient: typeof inPatient_view.$inferSelect;
    onclick?: Function;
    disableIfDischarged?: boolean;
  };

  let { patient = $bindable(), onclick, disableIfDischarged = false }: PropsT = $props();
</script>

<button
  onclick={(e) => {
    e.preventDefault();
    e.stopPropagation();

    onclick?.();
  }}
  class:discharged={!!patient.discharge_time}
  disabled={disableIfDischarged && !!patient.discharge_time}
>
  <strong>{patient.full_name}</strong>
  <dl>
    <dt>الرقم الموحد</dt>
    <dd>{patient.person_id}</dd>

    <dt>رقم الملف</dt>
    <dd>{patient.patient_file_number}</dd>

    {#if patient.id_doc_number}
      <dt>{patient.id_doc_type}</dt>
      <dd>{patient.id_doc_number}</dd>
    {/if}

    <dt>الدخول</dt>
    <dd>{formatDate(patient.admission_time, 'YYYY/MM/DD')}</dd>

    {#if patient.discharge_time}
      <dt>الخروج</dt>
      <dd>{formatDate(patient.discharge_time, 'YYYY/MM/DD')}</dd>
    {/if}

    <dt>آخر قسم</dt>
    <dd>{patient.ward_name}</dd>
  </dl>
</button>

<style>
  button {
    display: flex;
    flex-direction: column;
    align-items: center;

    &.discharged {
      background-color: light-dark(salmon, maroon);
    }
  }

  dl {
    display: grid;
    grid-template-columns: 1fr 2fr;

    dt {
      justify-self: end;
    }

    dd {
      justify-self: start;
    }
  }
</style>
