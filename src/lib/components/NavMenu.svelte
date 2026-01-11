<script lang="ts">
  import type { Snippet } from 'svelte';

  type PropsT = {
    label?: string;
    name?: string;
    links: (
      | {
          href: string;
          label: string;
        }
      | 'separator'
    )[];
    permission?: ({ role: number } | { affiliation: number })[];
    children?: Snippet;
  };

  let { label, name, links, children }: PropsT = $props();
</script>

{#if name}
  <li>
    <button
      type="button"
      popovertarget="{name}-menu"
      style:anchor-name="--{name}-menu-button"
    >
      {#if label}
        {label}
      {:else if children}
        {@render children()}
      {/if}
    </button>

    <ul id="{name}-menu" popover style:position-anchor="--{name}-menu-button">
      {#each links as link, i (i)}
        {#if typeof link !== 'string'}
          <li><a href={link.href}>{link.label}</a></li>
        {:else}
          <hr />
        {/if}
      {/each}
    </ul>
  </li>
{:else}
  <ul class="logged-out">
    {#each links as link, i (i)}
      {#if typeof link !== 'string'}
        <li><a href={link.href}>{link.label}</a></li>
      {/if}
    {/each}
  </ul>
{/if}

<style>
  a {
    color: light-dark(
      hsl(from var(--main-text-color) h s 20%),
      hsl(from var(--main-text-color) h s 80%)
    );
    font-size: 1.1rem;
    text-decoration: none;

    &:focus {
      outline: 2px solid;
      outline-offset: 0.5rem;
      border-radius: 0.25rem;
    }
  }

  ul.logged-out {
    display: flex;
    gap: 1.5rem;
    list-style: none;
    align-items: center;

    li {
      border-radius: 0.25rem;
      padding: 0.25rem 0.2rem;
    }
  }

  li:has(button) {
    padding: 0.25rem;
    border-radius: 4px;

    button {
      all: unset;
      cursor: pointer;
    }
  }

  li:has(ul) {
    ul[popover] {
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;

      list-style: none;

      background-color: var(--main-bg-color);
      border: var(--main-border);
      border-radius: 0.25rem;
      box-shadow: black 10px 10px 25px;

      hr {
        margin-block: 0;
        width: 98%;
      }

      li {
        text-wrap: nowrap;
      }

      &:popover-open {
        display: flex;
      }
    }
  }

  @supports (top: anchor(top)) {
    li > ul {
      inset: unset;
      position: absolute;
      inset-block-start: calc(anchor(bottom) + 0.25rem);
      inset-inline-start: anchor(right);
      position-try-fallbacks: --below-right, --below-left;
    }
  }

  li:is(:hover, :focus, :focus-within):not(:has(.gravatar)) {
    background-color: hsl(from var(--main-bg-color) h s 50%);
  }

  @position-try --below-left {
    inset: unset;
    inset-block-start: calc(anchor(bottom) + 0.25rem);
    inset-inline-start: anchor(right);
  }

  @position-try --below-right {
    inset: unset;
    inset-block-start: calc(anchor(bottom) + 0.25rem);
    inset-inline-end: anchor(left);
  }
</style>
