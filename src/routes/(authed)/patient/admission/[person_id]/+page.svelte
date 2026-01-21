<script lang="ts">
  import ListMaker from '$lib/components/Forms/ListMaker.svelte';
  import Picker from '$lib/components/Forms/Picker.svelte';
  import { formatDate } from '$lib/utils/date-format';

  const { data, form } = $props();

  let returnedDiagnosesOnFormError = form?.diagnosis ? form.diagnosis : null;

  let patientFileNumber = $state(form?.patientFileNumber ?? '');
  let healthInsurance = $state(form?.healthInsurance === true);
  let diagnoses = $state<string[]>(returnedDiagnosesOnFormError ?? []);
  let diagnosisText = $state('');
  let admissionWard = $state(form?.admissionWard ? Number(form.admissionWard) : null);
  let admissionDate = $state(
    form?.admissionDate ?? formatDate(new Date(), 'YYYY-MM-DDTHH:mm')
  );

  let referredFrom = $state('reception');
  let securityStatus = $state(false);
</script>

<form method="POST" class="flex-form">
  <div class="input-pair">
    <label for="patient_file_number">رقم الملف</label>
    <div class="patient_file_number_input">
      <!-- svelte-ignore a11y_autofocus -->
      <input
        type="number"
        name="patient_file_number"
        id="patient_file_number"
        placeholder={String(data.nextFileNumber)}
        autofocus
        bind:value={patientFileNumber}
        required
      />
      {#if !patientFileNumber}
        <button
          type="button"
          onclick={() => {
            patientFileNumber = data.nextFileNumber;
          }}
        >
          {String(data.nextFileNumber)}
        </button>
      {/if}
    </div>
  </div>

  <input type="hidden" name="person_name" id="person_name" value={data.person_name} />

  <!-- todo: use ISelect to insert diagnoses -->
  <ListMaker
    name="diagnosis"
    label="التشخيص"
    bind:value={diagnosisText}
    bind:list={diagnoses}
    datalist={data.diagnoses_list}
  />

  <Picker
    name="admission_ward"
    label="قسم الدخول"
    options={data.wards_list}
    bind:value={admissionWard}
    dividerList={data.floors_list}
    dividerKey="floor"
  />

  <Picker
    name="health_insurance"
    label="التأمين الصحي"
    options={[
      { id: true, name: 'مؤمن عليه' },
      { id: false, name: 'غير مؤمن عليه' },
    ]}
    bind:value={healthInsurance}
  />

  <Picker
    name="referred_from"
    label="محول من"
    options={[{ id: 'reception', name: 'الاستقبال' }]}
    bind:value={referredFrom}
    other
  />

  <Picker
    name="security_status"
    label="الوضع الأمني"
    options={[
      { id: false, name: 'حر' },
      { id: true, name: 'مسجون' },
    ]}
    bind:value={securityStatus}
  />

  <div class="input-pair">
    <label for="admission_date">وقت وتاريخ الدخول</label>
    <input
      type="datetime-local"
      name="admission_date"
      id="admission_date"
      bind:value={admissionDate}
      required
    />
  </div>

  <div class="input-pair">
    <label for="admission_notes">ملاحظات</label>
    <textarea name="admission_notes" id="admission_notes"></textarea>
  </div>

  <input type="submit" value="تسجيل" />
</form>

<style>
  div.patient_file_number_input {
    display: grid;
    grid-template-columns: 1fr max-content;
    gap: 0.25rem;
  }
</style>
