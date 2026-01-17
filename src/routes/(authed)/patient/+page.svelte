<script lang="ts">
  import { goto } from '$app/navigation';
  import ISelect from '$lib/components/Forms/iSelect.svelte';
  import PatientButton from '$lib/components/Forms/PatientButton.svelte';
  import type { inPatient_view } from '$server/db/schema/entities/patients';
</script>

<ISelect
  endpoint="/api/patients/"
  type="text"
  id="name"
  name="patient_name"
  autocomplete="off"
  autofocus
>
  {#snippet optionSnippet(patient: typeof inPatient_view.$inferSelect)}
    <PatientButton
      {patient}
      onclick={() => {
        goto(`/patient/${patient.patient_id}`);
      }}
    />
  {/snippet}
</ISelect>
