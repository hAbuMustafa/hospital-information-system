<script lang="ts">
  import { nationalIdPattern } from '$lib/stores/patterns';
  import Picker from '$lib/components/Forms/Picker.svelte';

  const { data } = $props();

  let firstName = $derived(data.person.first_name);
  let fatherName = $derived(data.person.father_name);
  let grandfatherName = $derived(data.person.grandfather_name);
  let familyName = $derived(data.person.family_name ?? '');
  let idDocType = $derived(data.person.id_doc_type_id ?? 1);
  let idDocNum = $derived(data.person.id_doc_number ?? '');
  let isNationalId = $derived(idDocType === 1 && nationalIdPattern.test(idDocNum));
  let gender = $derived.by(() => {
    if (isNationalId) {
      return Number(idDocNum.slice(12, 13)) % 2 === 1;
    }
    return data.person?.gender;
  });
  let birthdate = $derived.by(() => {
    if (isNationalId) {
      const modifier = idDocNum[0];
      const year = (modifier === '2' ? '19' : '20') + idDocNum.slice(1, 3);
      const month = idDocNum.slice(3, 5);
      const day = idDocNum.slice(5, 7);

      return [year, month, day].join('-');
    }
    return data.person?.birthdate;
  });

  let hasAName = $derived(!firstName && !fatherName && !grandfatherName && !familyName);
</script>

<form method="POST" class="flex-form">
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

  <Picker
    label="نوع الهوية"
    name="id_doc_type"
    options={data.id_doc_type_list}
    bind:value={idDocType}
  />

  <div class="input-pair">
    <label for="id_doc_num">رقم الهوية</label>
    <input
      name="id_doc_num"
      id="id_doc_num"
      type="text"
      bind:value={idDocNum}
      pattern={idDocType === 1 ? nationalIdPattern.source : null}
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
    locked={isNationalId}
  />

  <div class="input-pair">
    <label for="birthdate" class:locked={isNationalId}>تاريخ الميلاد</label>
    <input
      name="birthdate"
      id="birthdate"
      type="date"
      bind:value={birthdate}
      readonly={isNationalId}
    />
  </div>

  <input type="submit" value="تعديل" />
</form>

<style>
  .input-group {
    display: grid;
    grid-template-columns: repeat(4, 3fr) 1fr;
    gap: 0.5rem;
  }
</style>
