<script lang="ts">
  import ISelect from '$lib/components/Forms/iSelect.svelte';
  import PatientButton from '$lib/components/Forms/PatientButton.svelte';
  import Picker from '$lib/components/Forms/Picker.svelte';
  import { formatDate } from '$lib/utils/date-format';
  import type { inPatient_view } from '$server/db/schema/entities/patients.js';

  const { data, form } = $props();

  let patientName = $derived(data.patient?.full_name ?? form?.patientName ?? '');
  let selectedPatientId = $derived(data.patient?.patient_id ?? form?.patientId ?? '');
  let selectedPatientRecentWardId = $derived(
    data.patient?.recent_ward_id ?? form?.selectedPatientRecentWardId ?? 0,
  );
  let selectedWard = $derived(form?.transferTo ? Number(form?.transferTo) : 0);
  let transferDate = $derived(
    form?.transferTime ?? formatDate(new Date(), 'YYYY-MM-DDTHH:mm'),
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
        patientName = '';
        selectedPatientRecentWardId = 0;
      }}
      autocomplete="off"
      required={Boolean(!selectedPatientId) ?? null}
      autofocus
    >
      {#snippet optionSnippet(patient: typeof inPatient_view.$inferSelect)}
        <PatientButton
          {patient}
          onclick={() => {
            selectedPatientId = patient.patient_id;
            patientName = patient.full_name;
            selectedPatientRecentWardId = patient.recent_ward_id;
          }}
        />
      {/snippet}
    </ISelect>
  </div>

  <input type="hidden" name="patient_id" bind:value={selectedPatientId} required />

  <input
    type="hidden"
    name="patient_recent_ward"
    bind:value={selectedPatientRecentWardId}
    required
  />

  <div class="input-pair">
    <label for="transfer_date">وقت التحويل</label>
    <input
      type="datetime-local"
      name="transfer_date"
      id="transfer_date"
      bind:value={transferDate}
      required
    />
  </div>

  <Picker
    name="ward"
    label="يحول إلى قسم"
    options={data.wards}
    disable={[selectedPatientRecentWardId]}
    bind:value={selectedWard}
  />

  <div class="input-pair">
    <label for="transfer_notes">ملاحظات</label>
    <textarea name="transfer_notes" id="transfer_notes"></textarea>
  </div>

  <input type="submit" value="تسجيل" />
</form>
