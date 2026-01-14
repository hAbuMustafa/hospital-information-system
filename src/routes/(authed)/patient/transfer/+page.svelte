<script lang="ts">
  import ISelect from '$lib/components/Forms/iSelect.svelte';
  import PatientButton from '$lib/components/Forms/PatientButton.svelte';
  import Picker from '$lib/components/Forms/Picker.svelte';
  import { formatDate } from '$lib/utils/date-format';

  type PatientT = {
    id: string;
    name: string;
    id_doc_num: string;
    admission_date: Date;
    recent_ward_id: number;
  };

  const { data, form } = $props();

  let patientName = $state(data.patient?.Person?.name ?? form?.patientName ?? '');
  let selectedPatientId = $state(data.patient?.id ?? form?.patientId ?? '');
  let selectedPatientRecentWardId = $derived.by(() => {
    if (data.patient?.recent_ward) {
      return data.patient?.recent_ward;
    } else if (form?.selectedPatientRecentWardId) {
      return form?.selectedPatientRecentWardId;
    } else {
      return 0;
    }
  });
  let selectedWard = $state(form?.transferTo ? Number(form?.transferTo) : 0);
  let transferDate = $state(
    form?.transferTime ?? formatDate(new Date(), 'YYYY-MM-DDTHH:mm')
  );

  let hasSelectedPatient = $derived(
    (form?.patientId?.length ?? 0) > 3 ? true : !!selectedPatientId
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
      {#snippet optionSnippet(patient: PatientT)}
        <PatientButton
          {patient}
          onclick={() => {
            selectedPatientId = patient.id;
            patientName = patient.name;
            selectedPatientRecentWardId = patient.recent_ward_id;
          }}
        />
      {/snippet}
    </ISelect>
    <input type="hidden" name="patient_id" bind:value={selectedPatientId} required />
  </div>

  <input
    type="hidden"
    name="patient_recent_ward"
    bind:value={selectedPatientRecentWardId}
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
    <textarea
      name="transfer_notes"
      id="transfer_notes"
      required={[3, 9].some((id) => selectedWard === id)}
    ></textarea>
  </div>

  <input type="submit" value="تسجيل" />
</form>
