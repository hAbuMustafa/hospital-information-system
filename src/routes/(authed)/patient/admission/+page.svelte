<script lang="ts">
  import { arabicTriadicNamesPattern, nationalIdPattern } from '$lib/stores/patterns';
  import ISelect from '$lib/components/Forms/iSelect.svelte';
  import PersonButton from '$lib/components/Forms/PersonButton.svelte';
  import type { people_view } from '$lib/server/db/schema/entities/people';
  import Picker from '$lib/components/Forms/Picker.svelte';

  type FetchedPersonT = typeof people_view.$inferSelect;

  const { data, form } = $props();

  let personName = $state('');
  let firstName = $state(form?.firstName ?? '');
  let fatherName = $state(form?.fatherName ?? '');
  let grandfatherName = $state(form?.grandfatherName ?? '');
  let familyName = $state(form?.familyName ?? '');
  let idDocType = $state(form?.idDocType ? Number(form.idDocType) : 1);
  let idDocNum = $state(form?.idDocNum ?? '');
  let isNationalId = $derived(idDocType === 1 && nationalIdPattern.test(idDocNum));
  let gender = $derived.by(() => {
    if (isNationalId) {
      return Number(idDocNum.slice(12, 13)) % 2 === 1;
    }
    return form?.gender;
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

  let selectedPersonId = $state(0);

  let hasAName = $derived(!firstName && !fatherName && !grandfatherName && !familyName);

  let hasSelectedPerson = $state(false);

  function selectPerson(person: FetchedPersonT) {
    hasSelectedPerson = true;

    selectedPersonId = person.person_id;

    idDocType = person.id_doc_type_id ?? 1;

    idDocNum = person.id_doc_number ?? '';

    birthdate = person.birthdate?.toString();

    if (person.gender !== null) {
      gender = person.gender;
    }
  }
</script>

<form method="POST" class="flex-form">
  {#if hasAName}
    <div class="input-pair">
      <label for="name" class={hasSelectedPerson ? 'locked' : ''}>بحث عن مريض </label>
      <ISelect
        endpoint="/api/people/"
        type="text"
        id="name"
        bind:done={hasSelectedPerson}
        bind:value={personName}
        pattern={arabicTriadicNamesPattern.source}
        onclear={() => {
          selectedPersonId = 0;
          firstName = '';
          fatherName = '';
          grandfatherName = '';
          familyName = '';
        }}
        readonly={hasSelectedPerson}
        autocomplete="off"
        autofocus
      >
        {#snippet optionSnippet(person: FetchedPersonT)}
          <PersonButton {person} onclick={() => selectPerson(person)} />
        {/snippet}
      </ISelect>
    </div>
  {/if}

  <div class="input-pair">
    <label for="first_name">اسم المريض</label>
    <div class="input-group">
      <input
        type="text"
        name="first_name"
        id="first_name"
        placeholder="الاسم الأول"
        bind:value={firstName}
        required
      />
      <input
        type="text"
        name="father_name"
        id="father_name"
        placeholder="اسم الأب"
        bind:value={fatherName}
        required
      />
      <input
        type="text"
        name="grandfather_name"
        id="grandfather_name"
        placeholder="اسم الجد"
        bind:value={grandfatherName}
        required
      />
      <input
        type="text"
        name="family_name"
        id="family_name"
        placeholder="اسم العائلة"
        bind:value={familyName}
        required
      />

      <button
        type="button"
        disabled={hasAName}
        onclick={() => {
          firstName = '';
          fatherName = '';
          grandfatherName = '';
          familyName = '';
        }}
      >
        مسح
      </button>
    </div>
  </div>

  <input type="hidden" name="person_id" bind:value={selectedPersonId} />

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
      { id: true, name: 'ذكر' },
      { id: false, name: 'أنثى' },
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

  <input type="submit" value="تسجيل البيانات الشخصية" />
</form>

<style>
  .input-group {
    display: grid;
    grid-template-columns: repeat(4, 3fr) 1fr;
    gap: 0.5rem;
  }
</style>
