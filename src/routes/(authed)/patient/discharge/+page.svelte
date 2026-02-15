<script lang="ts">
  import ISelect from '$lib/components/Forms/iSelect.svelte';
  import PatientButton from '$lib/components/Forms/PatientButton.svelte';
  import Picker from '$lib/components/Forms/Picker.svelte';
  import { formatDate } from '$lib/utils/date-format';
  import type { inPatient_view } from '$server/db/schema/entities/patients';

  const { data, form } = $props();

  let patientName = $derived(data.patient?.full_name ?? form?.patientName ?? '');
  let selectedPatientId = $derived(data.patient?.patient_id ?? form?.patientId ?? '');
  let selectedDischargeReason = $derived(
    form?.dischargeReason ? Number(form.dischargeReason) : 0,
  );
  let dischargeDate = $derived(
    form?.dischargeTime ?? formatDate(new Date(), 'YYYY-MM-DDTHH:mm'),
  );

  let hasSelectedPatient = $derived(
    !!(data.patient?.patient_id ?? form?.patientId ?? selectedPatientId),
  );
</script>

<form method="POST" class="flex-form">
  <div class="input-pair">
    <label for="name"> اسم المريض </label>
    <ISelect
      endpoint="/api/patients/?cro=true"
      type="text"
      id="name"
      name="patient_name"
      bind:value={patientName}
      bind:done={hasSelectedPatient}
      readonly={hasSelectedPatient ?? false}
      onclear={() => {
        selectedPatientId = '';
      }}
      autocomplete="off"
      required={Boolean(!selectedPatientId) ?? null}
      autofocus
    >
      {#snippet optionSnippet(patient: typeof inPatient_view.$inferSelect)}
        <PatientButton
          {patient}
          onclick={() => {
            patientName = patient.full_name;
            selectedPatientId = patient.patient_id;
          }}
        />
      {/snippet}
    </ISelect>
    <input type="hidden" name="patient_id" bind:value={selectedPatientId} required />
  </div>

  <div class="input-pair">
    <label for="discharge_date">وقت الخروج</label>
    <input
      type="datetime-local"
      name="discharge_date"
      id="discharge_date"
      bind:value={dischargeDate}
      required
    />
  </div>

  <Picker
    name="discharge_reason"
    label="سبب الخروج"
    options={data.discharge_reasons}
    bind:value={selectedDischargeReason}
  />

  <div class="input-pair">
    <label for="discharge_notes">ملاحظات</label>
    <textarea
      name="discharge_notes"
      id="discharge_notes"
      required={[3, 9].some((id) => selectedDischargeReason === id)}
    ></textarea>
  </div>

  <input type="submit" value="تسجيل" />
</form>
