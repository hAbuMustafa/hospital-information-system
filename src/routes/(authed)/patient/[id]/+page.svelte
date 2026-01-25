<script lang="ts">
  import Timeline from '$comp/Timeline/Timeline.svelte';
  import { formatDate, getAge, getDuration, getTermed } from '$lib/utils/date-format';
  import Sheet from '$lib/components/Sheet/Sheet.svelte';

  let { data } = $props();

  const dateAndTime = (date: number | Date) => {
    return formatDate(date, 'YYYY/MM/DD (hh:mm)');
  };
</script>

{#if data.patient}
  <section class="personal_details">
    <details>
      <summary>البيانات الشخصية</summary>
      <dl class="personal_data">
        <dt>الرقم الموحد:</dt>
        <dd>{data.patient.person_id}</dd>

        {#if data.patient.id_doc_type_id !== 1}
          <!-- todo: separate nationality in a separate column -->
          <dt>الجنسية:</dt>
          <dd>{data.patient.admission_notes}</dd>
        {/if}

        <dt>{data.patient.id_doc_type}:</dt>
        <dd>{data.patient.id_doc_number}</dd>

        {#if data.patient.birthdate}
          <dt>تاريخ الميلاد:</dt>
          <dd>
            {formatDate(new Date(data.patient.birthdate), 'YYYY/MM/DD')} ({getAge(
              data.patient.birthdate,
            )} سنة)
          </dd>
        {/if}

        {#if data.patient.gender}
          <dt>النوع:</dt>
          <dd>{data.patient.gender ? 'ذكر' : 'أنثى'}</dd>
        {/if}

        <dt>التأمين الصحي:</dt>
        <dd>{data.patient.health_insurance ? '' : 'غير '} مؤمن عليه</dd>
      </dl>
    </details>
    <a href="/person/{data.patient.person_id}" class="button">تعديل البيانات الشخصية</a>
  </section>

  <section>
    <h2>بيانات الإقامة</h2>
    <dl class="stay-data">
      <dt>رقم الملف:</dt>
      <dd>{data.patient.patient_file_number}</dd>

      <dt>تاريخ الدخول:</dt>
      <dd>{dateAndTime(data.patient.admission_time)}</dd>

      {#if data.patient.admission_notes}
        <dt>ملاحظات الدخول:</dt>
        <dd>{data.patient.admission_notes}</dd>
      {/if}

      {#if data.patient.security_status}
        <dt>الوضع الأمني:</dt>
        <dd>مسجون</dd>
      {/if}

      {#if data.patient.discharge_time}
        <dt>تاريخ الخروج:</dt>
        <dd>{dateAndTime(data.patient.discharge_time)}</dd>

        <dt>سبب الخروج:</dt>
        <dd>{data.patient.discharge_reason}</dd>

        <dt>مدة الإقامة:</dt>
        {@const daysOfStay = getDuration(
          data.patient.admission_time,
          data.patient.discharge_time,
        )}
        <dd>
          {getTermed(daysOfStay, 'يوم', 'أيام')}
        </dd>
      {/if}

      {#if !data.patient.discharge_time}
        <dt>القسم:</dt>
        <dd>{data.patient.ward_name}</dd>
      {/if}
    </dl>

    <h3>التشخيص</h3>
    <ol class="diagnosis_list">
      {#each data.diagnoses as diagnosis, i (i)}
        {#each diagnosis.diagnosis.split(' + ') as d, j (j)}
          <li class="diagnosis_pair">
            <span class="diagnosis_name">{d}</span>
            <span class="diagnosis_time">
              {diagnosis.diagnosis_type === 'Initial'
                ? '(أولي)'
                : dateAndTime(diagnosis.timestamp)}
            </span>
          </li>
        {/each}
      {/each}
    </ol>

    <details>
      <summary><h3 style="display: inline-block;">التنقلات</h3></summary>
      <Timeline
        events={data.transfers}
        eventTitle_name="to_ward"
        eventTime_name="timestamp"
        endEvent_time={data.patient.discharge_time}
        endEvent_label="خروج"
        dateTimeFormatter={dateAndTime}
        alternate={true}
      />
    </details>
  </section>
  {#if data.other_admissions?.length}
    {@const sheetRows = data.other_admissions.map((p) => {
      const {
        patient_file_number,
        patient_id,
        admission_time,
        discharge_time,
        discharge_reason,
      } = p;

      return {
        patient_id,
        patient_file_number,
        admission_date: new Date(admission_time),
        discharge_date: discharge_time ? new Date(discharge_time) : null,
        discharge_reason,
      };
    })}
    <section class="other_admissions">
      <h2>الإقامات الأخرى</h2>
      <Sheet
        rows={sheetRows}
        dateColumns={{ admission_date: 'YYYY/MM/DD', discharge_date: 'YYYY/MM/DD' }}
        renameColumns={{
          patient_id: 'رقم القيد',
          patient_file_number: 'رقم الملف',
          admission_date: 'تاريخ الدخول',
          discharge_date: 'تاريخ الخروج',
          discharge_reason: 'سبب الخروج',
        }}
        detailsColumn={{ patient_id: (p: any) => `/patient/${p.patient_id}` }}
      />
    </section>
  {/if}
{/if}

<style>
  section {
    border: var(--main-border);
    border-radius: 0.5rem;
    margin-block-end: 1rem;
    padding-inline: 1rem;
  }

  section.personal_details {
    display: grid;
    grid-template-columns: 1fr 10%;
    padding-block: 1rem;

    a.button {
      place-self: start;
    }
  }

  section.other_admissions {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding-block-end: 1rem;
  }

  details {
    padding: 1rem;
    border-radius: 0.5rem;

    summary {
      border-radius: 0.5rem;
    }

    &:is(:hover, :focus, :active):not(:open) summary {
      background-color: hsl(from var(--main-bg-color) h s 40%);
    }
  }

  dl {
    display: grid;
    row-gap: 0.5rem;
  }

  dl.personal_data,
  dl.stay-data {
    grid-template-columns: 1fr 80%;
  }

  ol.diagnosis_list {
    padding: 0;
    display: flex;
    gap: 0.5rem;
    list-style: none;
    justify-content: center;

    li {
      background-color: gold;
      color: light-dark(var(--main-text-color), var(--main-bg-color));
      padding: 0.25rem 0.5rem;
      border-radius: 0.5rem;
      text-align: center;

      .diagnosis_name {
        font-weight: bold;
      }

      .diagnosis_time {
        display: none;
      }

      &:is(:hover, :focus, :active) .diagnosis_time {
        display: inline;
      }
    }
  }

  dt {
    font-weight: 700;
    text-wrap: nowrap;
  }

  dt:hover,
  dt:hover + dd,
  dt + dd:hover,
  dt:has(+ dd:hover) {
    background-color: light-dark(
      hsl(from var(--main-bg-color) h s 80%),
      hsl(from var(--main-bg-color) h s 30%)
    );
  }

  dt,
  dd {
    place-content: center;
  }
</style>
