export const menus: MenuT[] = [
  {
    label: 'المرضى',
    name: 'patient',
    links: [
      {
        href: '/patient/admission',
        label: 'تسجيل حالة دخول',
      },
      { href: '/patient/transfer', label: 'تحويل مريض إلى قسم' },
      { href: '/patient/discharge', label: 'تسجيل خروج مريض' },
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
