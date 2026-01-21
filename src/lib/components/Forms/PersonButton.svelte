<script lang="ts">
  import { formatDate, getAge } from '$lib/utils/date-format';
  import type { inPatient_view } from '$server/db/schema/entities/patients';

  type PropsT = {
    person: typeof inPatient_view.$inferSelect;
    onclick?: Function;
  };

  let { person = $bindable(), onclick }: PropsT = $props();
</script>

<button
  onclick={(e) => {
    e.preventDefault();
    e.stopPropagation();

    onclick?.();
  }}
>
  <strong>{person.full_name}</strong>
  <span>{person.id_doc_number}</span>
  {#if person.birthdate}
    <span>
      {formatDate(new Date(person.birthdate), 'YYYY/MM/DD')} ({getAge(person.birthdate)} سنة)
    </span>
  {/if}
</button>

<style>
  button {
    display: flex;
    flex-direction: column;
  }
</style>
