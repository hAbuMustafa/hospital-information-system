<script lang="ts">
  import ISelect from '$lib/components/Forms/iSelect.svelte';
  import PatientButton from '$lib/components/Forms/PatientButton.svelte';

  type PatientT = {
    id: string;
    name: string;
    id_doc_num: string;
    admission_date: Date;
    discharge_date?: Date;
    recent_ward: number;
  };

  let patientText = $state('');
  let selectedPatientId = $state('');
  let hasSelectedPatient = $state(false);
</script>

<ISelect
  endpoint={`/api/patients?q=${patientText}`}
  bind:value={patientText}
  bind:selectedValue={selectedPatientId}
  bind:done={hasSelectedPatient}
  onclear={() => {
    hasSelectedPatient = false;
    selectedPatientId = '';
  }}
>
  {#snippet optionSnippet(patient: PatientT)}
    <PatientButton {patient} disableIfDischarged={true} />
  {/snippet}
</ISelect>
