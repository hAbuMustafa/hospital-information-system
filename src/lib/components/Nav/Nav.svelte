<script lang="ts">
  import NavLogo from './NavLogo.svelte';
  import NavMenu from './NavMenu.svelte';
  import { menus } from './navList';

  function menuFilterPredicate<T extends { permission?: PermissionT }>(menu: T) {
    return user?.role === 1 || menu.permission?.role.some((r) => r === user?.role);
  }

  const { user }: { user: App.Locals['user'] } = $props();

  const userSpecificMenus = menus.filter(menuFilterPredicate).map((m) => {
    m.links = m.links.filter(menuFilterPredicate);
    return m;
  });

  const accountMenu: MenuT = {
    name: 'account',
    links: [
      { href: '/account', label: 'الحساب' },
      { href: '/logout', label: 'تسجيل الخروج' },
    ],
  };

  const loggedOutMenu: MenuT = {
    links: [
      { href: '/register', label: 'إنشاء حساب' },
      { href: '/login', label: 'تسجيل الدخول' },
    ],
  };
</script>

<nav aria-label="Primary Navigation">
  <NavLogo />

  {#if user}
    <ul>
      {#each userSpecificMenus as menu, i (i)}
        <NavMenu {...menu} />
      {/each}
    </ul>

    <ul>
      <NavMenu {...accountMenu}>
        <img
          class="gravatar"
          src={'/api/proxy-images/?url=' + user.gravatar}
          alt={`صورة حساب ${user.name}`}
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
  }

  .gravatar {
    border-radius: 50%;
  }
</style>
