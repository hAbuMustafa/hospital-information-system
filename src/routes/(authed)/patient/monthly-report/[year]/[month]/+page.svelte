<script lang="ts">
  import { page } from '$app/state';
  import { getDuration } from '$lib/utils/date-format';

  let { data } = $props();

  const { nextMonth, prevMonth, nextYear, prevYear } = $derived.by(() => {
    const currentMonth = Number(page.params.month);
    const currentYear = Number(page.params.year);

    return {
      nextMonth: currentMonth < 12 ? currentMonth + 1 : 1,
      prevMonth: currentMonth > 1 ? currentMonth - 1 : 12,
      nextYear: currentMonth < 12 ? currentYear : currentYear + 1,
      prevYear: currentMonth > 1 ? currentYear : currentYear - 1,
    };
  });

  const icuWard_ids = $derived(
    data.wards!.filter((w) => w.tags.some((t) => t === 'icu')).map((w) => w.id),
  );
</script>

<nav aria-label="Month Navigation">
  <a class="button" href="/patient/monthly-report/{prevYear}/{prevMonth}"
    >&Lt; {prevMonth}/{prevYear}</a
  >
  <a class="button" href="/patient/monthly-report/{nextYear}/{nextMonth}"
    >{nextMonth}/{nextYear} &Gt;</a
  >
</nav>

{#if data.stats}
  {@const icuAdmissions = data.stats.transfers.filter((t) =>
    icuWard_ids.some((w_id) => w_id === t.to_ward_id),
  )}
  {@const icuDischarges = data.stats.discharges.filter((d) =>
    icuWard_ids.some((w_id) => w_id === d.recent_ward_id),
  )}
  {@const transfersByPatient = Object.groupBy(data.stats.transfers, (t) => t.patient_id)}

  <h2>إحصائيات الدخول</h2>
  <dl>
    <dt>عدد حالات الدخول (ذكور):</dt>
    <dd>{data.stats.admissions.filter((p) => p.gender === true).length}</dd>

    <dt>عدد حالات الدخول (إناث):</dt>
    <dd>{data.stats.admissions.filter((p) => p.gender === false).length}</dd>
  </dl>

  <dl>
    <dt>عدد حالات الدخول المنتفعين بالتأمين الصحي:</dt>
    <dd>{data.stats.admissions.filter((p) => p.health_insurance).length}</dd>

    <dt>غير المصريين:</dt>
    <dd>
      {data.stats.admissions.filter((p) => p.id_doc_type_id !== 1).length}
    </dd>
  </dl>

  <dl>
    <dt><strong>إجمالي حالات الدخول:</strong></dt>
    <dd>{data.stats.admissions.length}</dd>
  </dl>

  <h2>إحصائيات الخروج</h2>
  <dl>
    <dt>عدد حالات الخروج (ذكور):</dt>
    <dd>
      {data.stats.discharges.filter((p) => p.gender === true).length}
    </dd>

    <dt>عدد حالات الخروج (إناث):</dt>
    <dd>
      {data.stats.discharges.filter((p) => p.gender === false).length}
    </dd>
  </dl>

  <dl>
    <dt>إجمالي مدة الإقامة لحالات الخروج:</dt>
    <dd>
      {data.stats.discharges.reduce(
        (total, currentPatient) =>
          total +
          getDuration(currentPatient.admission_time, currentPatient.discharge_time),
        0,
      )}
    </dd>
  </dl>

  <dl>
    <dt><strong>إجمالي حالات الخروج:</strong></dt>
    <dd>{data.stats.discharges.length}</dd>
  </dl>

  <h2>إحصائيات الرعاية المركزة</h2>
  <dl>
    <dt>إجمالي حالات دخول الرعاية المركزة:</dt>
    <dd>{icuAdmissions.length}</dd>
    <dt>إجمالي حالات الدخول عن طريق الاستقبال:</dt>
    <dd>
      {data.stats.admissions.filter(
        (adm) =>
          adm.admitted_from?.includes('reception') &&
          icuWard_ids.some(
            (w_id) =>
              w_id ===
              icuAdmissions.find(
                (t) => t.patient_id === adm.patient_id && t.notes?.includes('admission'),
              )?.to_ward_id,
          ),
      ).length}
    </dd>
    <dt>إجمالي حالات الدخول عن طريق الأقسام الداخلية:</dt>
    <dd>
      {data.stats.transfers.filter(
        (t) =>
          icuWard_ids.some((w_id) => w_id === t.to_ward_id) &&
          !t.notes?.includes('admission'),
      ).length}
    </dd>
    <dt>إجمالي حالات الدخول عن طريق تنسيق المديرية:</dt>
    <dd>
      {data.stats.admissions.filter(
        (adm) => adm.admitted_from && !adm.admitted_from.includes('reception'),
      ).length}
    </dd>
  </dl>

  <dl>
    {#each Object.keys(Object.groupBy(icuDischarges, (pat) => pat.discharge_reason)) as dischargeReason, i (i)}
      <dt>حالات الخروج {dischargeReason}:</dt>
      <dd>
        {icuDischarges.filter((d) => d.discharge_reason === dischargeReason).length}
      </dd>
    {/each}
  </dl>

  <dl>
    <dt>حالات التحويل من الرعاية للأقسام الداخلية:</dt>
    <dd>
      {data.stats.transfers.filter((t) =>
        icuWard_ids.some((w_id) => w_id === t.from_ward_id),
      ).length}
    </dd>
  </dl>
{/if}

<style>
  nav {
    display: flex;
    justify-content: space-between;

    @media print {
      display: none;
    }
  }

  dl {
    display: grid;
    grid-template-columns: 2fr 1fr;
    max-width: 40%;
  }
</style>
