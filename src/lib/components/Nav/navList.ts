export const menus: MenuT[] = [
  {
    label: 'المرضى',
    name: 'patient',
    permission: { role: [0] },
    links: [
      [
        {
          href: '/patient/admission',
          label: 'تسجيل حالة دخول',
          permission: { role: [22] },
        },
        {
          href: '/patient/transfer',
          label: 'تحويل مريض إلى قسم',
          permission: { role: [22] },
        },
        {
          href: '/patient/discharge',
          label: 'تسجيل خروج مريض',
          permission: { role: [22] },
        },
      ],
      [{ href: '/patient/', label: 'استعلام عن مريض', permission: { role: [0] } }],
      [
        {
          href: '/patient/report',
          label: 'بيان المرضى بالأقسام',
          permission: { role: [0] },
        },
        {
          href: '/patient/icu-report',
          label: 'بيان الرعاية المركزة',
          permission: { role: [22] },
        },
        {
          href: '/patient/occupation-report',
          label: 'بيان الإشغال الحالي',
          permission: { role: [22] },
        },
      ],
      [
        {
          href: '/patient/monthly-report',
          label: ' تقرير الإشغال الشهري ',
          permission: { role: [22] },
        },
      ],
    ],
  },
  {
    label: 'الصيدلية',
    name: 'pharmacy',
    links: [
      [
        { href: '/pharmacy/dispense', label: 'صرف لمريض' },
        { href: '/pharmacy/return', label: 'مرتجع مريض' },
      ],
      [{ href: '/pharmacy/manual-bill', label: 'تسعير فاتورة لمريض' }],
      [
        { href: '/pharmacy/antibiotics-report', label: 'إحصائية المضادات الحيوية' },
        { href: '/pharmacy/daily-report', label: 'المنصرف اليومي' },
      ],
    ],
  },
  {
    label: 'المخزون',
    name: 'stock',
    links: [
      [
        { href: '/stock/dispense', label: 'صرف لجهة' },
        { href: '/stock/receive', label: 'استلام طلبية' },
        { href: '/stock/edit-stock', label: 'تعديل أرصدة' },
        { href: '/stock/stock-report', label: 'تقرير المخزون' },
      ],
    ],
  },
];
