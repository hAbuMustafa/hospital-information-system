<script lang="ts">
  import { formatDate, getTermed } from '$lib/utils/date-format';
  import { getFlagEmoji, obj as countries } from '$lib/utils/countries';
  import type { inPatient_view } from '$server/db/schema/entities/patients';
  import { inpatientPharmacist } from '$lib/utils/roles';

  let { data } = $props();
  let patientsByWard = $derived(
    Object.groupBy(data.patients, (p: typeof inPatient_view.$inferSelect) => p.ward_name)
  );
</script>

{#each data.wards.map((w) => w.name) as ward_name, i (i)}
  {#if patientsByWard[ward_name]}
    {@const currWard = data.wards.find((w) => w.name === ward_name)!}
    {@const wardOccupiedBeds = patientsByWard[ward_name].length}
    {@const wardOccupationRatio = wardOccupiedBeds / currWard.capacity}
    {@const progressColor =
      wardOccupationRatio < 0.5 ? 'green' : wardOccupationRatio < 0.8 ? 'orange' : 'red'}
    <div class="ward-wrapper">
      <h2 id={currWard.id.toString()}>
        <span>
          {currWard.name}
        </span>
        <span>
          {getTermed(wardOccupiedBeds, 'مريض', 'مرضى')}
          <progress value={wardOccupationRatio} style="accent-color: {progressColor};"
          ></progress>
          {getTermed(currWard.capacity, 'سرير', 'أسرَّة')}
        </span>
      </h2>

      <table>
        <colgroup>
          <col class="patient-identifier" />
          <col class="patient-cards" />
          <col class="patient-dates" />
          {#if data.user?.role === 1 || data.user?.role === 22}
            <col class="patient-actions" span="2" />
          {/if}
          {#if data.user?.role === 1 || inpatientPharmacist.some((r) => r.id === data.user?.role)}
            <col class="patient-dispense" />
          {/if}
        </colgroup>
        <thead>
          <tr>
            <th>رقم الملف</th>
            <th>اسم المريض</th>
            <th>تاريخ الدخول</th>
            {#if data.user?.role === 1 || data.user?.role === 22}
              <th>تحويل</th>
              <th>خروج</th>
            {/if}
            {#if data.user?.role === 1 || inpatientPharmacist.some((r) => r.id === data.user?.role)}
              <th>صرف علاج</th>
            {/if}
          </tr>
        </thead>
        <tbody>
          {#each patientsByWard[ward_name] as patient, ii (patient.patient_file_number)}
            <tr>
              <td>
                <a href="/patient/{patient.patient_id}" class="button"
                  >{patient.patient_file_number}</a
                >
              </td>
              <td>
                <div class="patient-card">
                  <span class="patient-name">{patient.full_name}</span>
                  {#if patient.gender !== null && patient.gender !== true}
                    <span class="patient-gender" title="(أنثى)">♀️</span>
                  {/if}
                  {#if patient.nationality !== null && patient.nationality !== 'EG'}
                    <span
                      class="patient-nationality"
                      title="({countries[patient.nationality].name_ar})"
                    >
                      {getFlagEmoji(patient.nationality)}
                    </span>
                  {/if}
                  {#if patient.security_status !== null && patient.security_status === true}
                    <span class="patient-security_status" title="(مسجون)">⛓️‍💥</span>
                  {/if}
                </div>
              </td>
              <td>{formatDate(patient.admission_time, 'YYYY/MM/DD')}</td>
              {#if data.user?.role === 1 || data.user?.role === 22}
                <td>
                  <a
                    href="/patient/transfer?patient_id={patient.patient_id}"
                    class="button"
                    style:background-color="orange"
                    style:color="light-dark(var(--main-text-color),var(--main-bg-color))"
                  >
                    تحويل
                  </a>
                </td>
                <td>
                  <a
                    href="/patient/discharge?patient_id={patient.patient_id}"
                    class="button"
                    style:background-color="light-dark(salmon, maroon)"
                    style:color="light-dark(var(--main-text-color),var(--main-text-color))"
                  >
                    خروج
                  </a>
                </td>
              {/if}
              {#if data.user?.role === 1 || inpatientPharmacist.some((r) => r.id === data.user?.role)}
                <td>
                  <a
                    href="/pharmacy/dispense?patient_id={patient.patient_id}"
                    class="button"
                    style:background-color="green"
                    style:color="white"
                  >
                    صرف
                  </a>
                </td>
              {/if}
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  {/if}
{/each}

<style>
  .ward-wrapper {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: repeat(max-content, 2);

    overflow-x: scroll;
  }

  h2 {
    display: flex;
    justify-content: space-around;
    position: sticky;
    inset-block-start: 0;
    background-color: var(--main-bg-color);
    padding-block: 1rem;

    @media (max-width: 400px) {
      flex-direction: column;
      align-items: center;

      progress {
        width: 20vw;
      }
    }

    @media print {
      break-after: avoid;
    }
  }

  table {
    justify-self: center;
    border-collapse: collapse;

    white-space: nowrap;
  }

  .patient-identifier {
    width: 9ch;
  }
  .patient-cards {
    width: 30ch;
  }
  .patient-dates {
    width: 12ch;
  }
  .patient-actions {
    width: 9ch;
  }

  thead {
    position: sticky;
    inset-block-start: 3.75rem;
  }

  tr:has(th) {
    background-color: hsl(from var(--main-bg-color) h s 60%);
    color: var(--main-bg-color);
    border: var(--main-border);
  }

  th {
    padding: 0.5rem;
    text-align: center;
  }

  th:not(:last-of-type) {
    border-inline-end: var(--main-border);
  }

  tbody {
    tr {
      border: var(--main-border);
      transition:
        transform 0.2s ease-in-out,
        background-color 0.5s ease-in-out;
    }

    tr:is(:hover, :focus-within, :active) {
      background-color: light-dark(
        hsl(from var(--main-bg-color) h s 80%),
        hsl(from var(--main-bg-color) h s 30%)
      );
      transform: scale(1.03);
    }

    td {
      border: var(--main-border);
      padding: 0.5rem;
      text-align: center;
      text-wrap: wrap;
    }

    a.button {
      display: inline-block;
      width: 80%;

      @media print {
        all: unset;
      }
    }

    .patient-card {
      display: flex;
      justify-content: space-between;

      .patient-name {
        flex-basis: 1;
      }
    }
  }
</style>
