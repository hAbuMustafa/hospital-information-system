<script lang="ts">
  type PropsT = {
    label: string;
    options: any[];
    value: any;
    locked?: boolean;
    name: string;
    disable?: any[];
    dividerList?: any[];
    dividerKey?: string;
    other?: boolean;
  };

  let {
    label = '',
    options = [],
    value = $bindable(),
    locked = $bindable(false),
    name = '',
    disable,
    dividerList,
    dividerKey,
    other,
    ...otherProps
  }: PropsT = $props();

  let otherText = $state('');

  $effect(() => {
    if (otherText !== '') value = otherText;
  });
</script>

<fieldset class={locked ? 'locked' : ''} {...otherProps}>
  <legend>{label}</legend>
  {#if !dividerList || !dividerKey}
    {#each options as opt, i (opt.id)}
      {@render optionPick(opt)}
    {/each}
  {:else}
    {#each dividerList as div (div.id)}
      <fieldset class={div.title}>
        {#each options.filter((d: any) => d[dividerKey] === div.id) as opt (opt.id)}
          {@render optionPick(opt)}
        {/each}
      </fieldset>
    {/each}
  {/if}
  {#if other}
    <input
      type="radio"
      {name}
      value={otherText}
      id="{name}_other"
      bind:group={value}
      required
      disabled={locked || (disable && disable.includes('other'))}
    />
    <label for="{name}_other"
      >جهة أخرى:
      <input
        type="text"
        bind:value={otherText}
        disabled={locked || (disable && disable.includes('other'))}
      />
    </label>
  {/if}
  <input type="hidden" {name} bind:value />
</fieldset>

{#snippet optionPick(opt: Record<string, any>)}
  <input
    id="{name}_{opt.id}"
    type="radio"
    value={opt.id}
    bind:group={value}
    disabled={locked || (disable && disable.includes(opt.id))}
    required
  />
  <label for="{name}_{opt.id}">
    <button
      onclick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        value = opt.id;
      }}
      disabled={locked || (disable && disable.includes(opt.id))}
    >
      {opt.name}
    </button>
  </label>
{/snippet}

<style>
  fieldset {
    &:has(> [type='radio'] + label) {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;

      justify-content: center;
    }

    & > fieldset {
      border: none;
      border-radius: unset;

      &:first-of-type {
        padding-block-start: unset;
      }

      &:not(:last-of-type) {
        border-block-end: var(--main-border);
      }
    }

    label {
      input:not([disabled]) + &:is(:focus-within, :focus, :active, :hover) {
        outline: var(--main-border);
        outline-offset: 0.25rem;
      }

      & > button {
        all: unset;
      }

      &:has(input[type='text']) {
        display: flex;
        align-items: center;
        gap: 0.5rem;

        > input[type='text'] {
          all: unset;

          max-width: 20vw;
          background-color: var(--main-bg-color);
          border: var(--main-border);
          border-radius: 0.25rem;
        }
      }
    }
  }
</style>
