<script lang="ts">
  import ListMaker from '$lib/components/Forms/ListMaker.svelte';

  import { arabicTriadicNamesPattern, nationalIdPattern } from '$lib/stores/patterns';
  import { formatDate } from '$lib/utils/date-format';
  import ISelect from '$lib/components/Forms/iSelect.svelte';
  import PersonButton from '$lib/components/Forms/PersonButton.svelte';
  import type { People } from '$lib/server/db/schema';
  import Picker from '$lib/components/Forms/Picker.svelte';

  type FetchedPersonT = typeof People.$inferSelect;

  const { data, form } = $props();

  let patientFileNumber = $state(form?.patientFileNumber ?? '');
  let patientName = $state(form?.patientName ?? '');
  let idDocType = $state(form?.idDocType ? Number(form.idDocType) : 1);
  let idDocNum = $state(form?.idDocNum ?? '');
  let isNationalId = $derived(idDocType === 1 && nationalIdPattern.test(idDocNum));
  let gender = $derived.by(() => {
    if (isNationalId) {
      return Number(idDocNum.slice(12, 13)) % 2 ? 1 : 0;
    }
    return form?.gender ? Number(form.gender) : null;
  });
  let birthdate = $derived.by(() => {
    if (isNationalId) {
      const modifier = idDocNum[0];
      const year = (modifier === '2' ? '19' : '20') + idDocNum.slice(1, 3);
      const month = idDocNum.slice(3, 5);
      const day = idDocNum.slice(5, 7);

      return [year, month, day].join('-');
    }
    return form?.birthdate;
  });
  let healthInsurance = $state(form?.heathInsurance ? Number(form.heathInsurance) : 0);

  let returnedDiagnosesOnFormError = form?.diagnosis ? form.diagnosis : null;
  let diagnoses = $state<string[]>(returnedDiagnosesOnFormError ?? []);
  let diagnosisText = $state('');

  let admissionWard = $state(form?.admissionWard ? Number(form.admissionWard) : null);

  let admissionDate = $state(
    form?.admissionDate ?? formatDate(new Date(), 'YYYY-MM-DDTHH:mm')
  );

  let hasSelectedPerson = $state(!!form?.personId || false);
  let selectedPersonId = $state(form?.personId ? Number(form?.personId) : 0);

  let referredFrom = $state('reception');
  let securityStatus = $state(0);

  function selectPerson(person: FetchedPersonT) {
    hasSelectedPerson = true;

    patientName = person.name;

    selectedPersonId = person.id;

    idDocType = person.id_doc_type ?? 1;

    idDocNum = person.id_doc_num ?? '';

    if (person.gender) {
      gender = Number(person.gender);
    }
  }
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
        autofocus
        bind:value={patientFileNumber}
        required
      />
    </div>
  </div>

  <div class="input-pair">
    <label for="name" class={hasSelectedPerson ? 'locked' : ''}> اسم المريض </label>
    <ISelect
      endpoint="/api/people/"
      name="name"
      type="text"
      id="name"
      bind:done={hasSelectedPerson}
      bind:value={patientName}
      pattern={arabicTriadicNamesPattern.source}
      readonly={hasSelectedPerson}
      onclear={() => {
        selectedPersonId = 0;
      }}
      autocomplete="off"
      required
    >
      {#snippet optionSnippet(person: FetchedPersonT)}
        <PersonButton {person} onclick={() => selectPerson(person)} />
      {/snippet}
    </ISelect>
  </div>

  <Picker
    label="نوع الهوية"
    name="id_doc_type"
    options={data.id_doc_type_list}
    bind:value={idDocType}
    locked={hasSelectedPerson}
  />

  <div class="input-pair">
    <label for="id_doc_num" class={hasSelectedPerson ? 'locked' : ''}>رقم الهوية</label>
    <input
      name="id_doc_num"
      id="id_doc_num"
      type="text"
      bind:value={idDocNum}
      pattern={idDocType === 1 ? nationalIdPattern.source : null}
      readonly={hasSelectedPerson}
      required={idDocType !== 6}
      disabled={idDocType === 6}
    />
  </div>

  <Picker
    name="gender"
    label="النوع"
    options={[
      { id: 1, name: 'ذكر' },
      { id: 0, name: 'أنثى' },
    ]}
    bind:value={gender}
    locked={hasSelectedPerson}
  />

  <div class="input-pair">
    <label for="birthdate" class={hasSelectedPerson ? 'locked' : ''}>تاريخ الميلاد</label>
    <input
      name="birthdate"
      id="birthdate"
      type="date"
      bind:value={birthdate}
      readonly={hasSelectedPerson}
      required
    />
  </div>

  <hr />

  <input type="hidden" name="person_id" bind:value={selectedPersonId} />

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
      { id: 1, name: 'مؤمن عليه' },
      { id: 0, name: 'غير مؤمن عليه' },
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
      { id: 0, name: 'حر' },
      { id: 1, name: 'مسجون' },
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
    <textarea name="admission_notes" id="admission_notes" required={idDocType === 6}
    ></textarea>
  </div>

  <input type="submit" value="تسجيل" />
</form>

<style>
  form {
    div.patient_file_number_input {
      display: grid;
      grid-template-columns: 1fr max-content;
    }
  }
</style>
