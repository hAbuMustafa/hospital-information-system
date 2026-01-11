<script lang="ts">
  import NavLogo from './NavLogo.svelte';
  import NavMenu from './NavMenu.svelte';

  const { user } = $props();

  type MenuT = {
    label?: string;
    name?: string;
    links: (
      | {
          href: string;
          label: string;
          permission?: ({ role: number } | { affiliation: number })[];
        }
      | 'separator'
    )[];
    permission?: ({ role: number } | { affiliation: number })[];
  };

  const menus: MenuT[] = [
    {
      label: 'المرضى',
      name: 'patient',
      links: [
        {
          href: '/patient/admission',
          label: 'تسجيل حالة دخول',
        },
        { href: '/patient/discharge', label: 'تسجيل خروج مريض' },
        { href: '/patient/transfer', label: 'تحويل مريض إلى قسم' },
        'separator',
        { href: '/patient/', label: 'استعلام عن مريض' },
        { href: '/patient/report', label: 'تقرير المرضى بالأقسام' },
        'separator',
        { href: '/patient/occupation-report', label: 'بيان الإشغال' },
        { href: '/patient/monthly-report', label: ' تقرير الإشغال الشهري ' },
      ],
    },
    {
      label: 'الصيدلية',
      name: 'pharmacy',
      links: [
        { href: '/pharmacy/dispense', label: 'صرف لمريض' },
        { href: '/pharmacy/return', label: 'مرتجع مريض' },
        { href: '/pharmacy/manual-bill', label: 'تسعير فاتورة لمريض' },
        'separator',
        { href: '/pharmacy/antibiotics-report', label: 'إحصائية المضادات الحيوية' },
        { href: '/pharmacy/daily-report', label: 'المنصرف اليومي' },
      ],
    },
    {
      label: 'المخزون',
      name: 'stock',
      links: [
        { href: '/stock/dispense', label: 'صرف لجهة' },
        { href: '/stock/receive', label: 'استلام طلبية' },
        { href: '/stock/edit-stock', label: 'تعديل أرصدة' },
        { href: '/stock/stock-report', label: 'تقرير المخزون' },
      ],
    },
  ];

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
      {#each menus as menu, i (i)}
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
