<script lang="ts">
  import { MenuIcon } from '@lucide/svelte';
  import NavLogo from './NavLogo.svelte';
  import NavMenu from './NavMenu.svelte';
  import { menus } from './navList';
  import { browser } from '$app/environment';

  function menuFilterPredicate<T extends { permission?: PermissionT }>(menu: T) {
    return (
      user?.role === 1 ||
      menu.permission?.role?.includes(0) ||
      menu.permission?.role?.some((r) => r === user?.role)
    );
  }

  const { user }: { user: App.Locals['user'] } = $props();

  const userSpecificMenus = $derived(
    menus.filter(menuFilterPredicate).map((m) => {
      m.links = m.links
        .map((linkGroup) => linkGroup.filter(menuFilterPredicate))
        .filter((linkGroup) => linkGroup.length);
      return m;
    })
  );

  const accountMenu: MenuT = {
    name: 'account',
    links: [
      [
        { href: '/account', label: 'الحساب' },
        { href: '/logout', label: 'تسجيل الخروج' },
      ],
    ],
  };

  const loggedOutMenu: MenuT = {
    links: [
      [
        { href: '/register', label: 'إنشاء حساب' },
        { href: '/login', label: 'تسجيل الدخول' },
      ],
    ],
  };

  let clientWidth = $state(0);
  let popover: '' | 'auto' | 'manual' | 'hint' | null | undefined = $state(null);

  let menuElement: HTMLUListElement | null = $state(null);

  if (browser) {
    const observer = new ResizeObserver(([entry]) => {
      clientWidth = entry.contentRect.width;
      popover = clientWidth < 400 ? 'auto' : null;
    });

    $effect(() => {
      if (menuElement) observer.observe(menuElement);

      return () => observer.disconnect();
    });
  }
</script>

<nav aria-label="Primary Navigation">
  <NavLogo />

  {#if user}
    <button
      type="button"
      id="logged-in-menu-toggle"
      title="القائمة الرئيسية"
      popovertarget="logged-in-menu"
      style:anchor-name="logged-in-menu"
    >
      <MenuIcon />
    </button>
    {#if userSpecificMenus.length}
      <ul id="logged-in-menu" bind:clientWidth {popover}>
        {#each userSpecificMenus as menu, i (i)}
          <NavMenu {...menu} />
        {/each}
      </ul>
    {/if}

    <ul id="account-menu-list">
      <NavMenu {...accountMenu}>
        <img
          class="gravatar"
          src={'/api/proxy-images/?url=' + user.gravatar}
          alt={`صورة حساب ${user.first_name}`}
          width="40px"
          height="40px"
        />
      </NavMenu>
    </ul>
  {:else}
    <NavMenu {...loggedOutMenu} />
  {/if}
</nav>

<style>
  nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;

    background-color: light-dark(
      hsl(from var(--main-bg-color) h s 80%),
      hsl(from var(--main-bg-color) h s 20%)
    );
    color: light-dark(
      hsl(from var(--main-text-color) h s 20%),
      hsl(from var(--main-text-color) h s 80%)
    );

    ul {
      display: flex;
      gap: 1.5rem;
      list-style: none;
      align-items: center;

      @media print {
        display: none;
      }
    }

    #account-menu-list {
      @media (max-width: 400px) {
        padding: 0;
      }
    }
  }

  #logged-in-menu-toggle {
    display: none;
    background-color: transparent;
    border: none;
    border-radius: 0.25rem;
    cursor: pointer;

    @media (max-width: 400px) {
      display: block;
    }

    &:hover {
      background-color: hsl(from var(--main-bg-color) h s 60%);
    }
  }

  #logged-in-menu {
    @media (max-width: 400px) {
      display: none;
      inset: unset;
      width: initial;
      flex-direction: column;
      position: absolute;
      inset-block-start: calc(anchor(bottom) + 0.25rem);
      justify-self: anchor-center;

      gap: 0.25rem;
      padding-inline: 1rem;

      background-color: var(--main-bg-color);
      border: var(--main-border);
      border-radius: 0.25rem;
      box-shadow: black 10px 10px 25px;

      &:popover-open {
        display: flex;
      }
    }
  }

  .gravatar {
    border-radius: 50%;
  }
</style>
