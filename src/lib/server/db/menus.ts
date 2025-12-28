export const ward_list = [
  { name: 'رعاية أ', floor: 1, id: 1, capacity: 15, tags: ['icu'] },
  { name: 'رعاية ب', floor: 1, id: 2, capacity: 5, tags: ['icu', 'quarantine'] },
  { name: 'ثاني أ', floor: 2, id: 3, capacity: 0, tags: [] },
  { name: 'ثاني ب', floor: 2, id: 4, capacity: 0, tags: [] },
  { name: 'ثاني ج', floor: 2, id: 5, capacity: 30, tags: ['insured-only', 'female'] },
  { name: 'ثاني د', floor: 2, id: 6, capacity: 30, tags: ['insured-only', 'male'] },
  { name: 'ثالث أ', floor: 3, id: 7, capacity: 30, tags: ['chest', 'female'] },
  { name: 'ثالث ب', floor: 3, id: 8, capacity: 30, tags: ['chest', 'male'] },
  { name: 'ثالث ج', floor: 3, id: 9, capacity: 7, tags: ['tb', 'female'] },
  { name: 'ثالث د', floor: 3, id: 10, capacity: 8, tags: ['tb', 'male'] },
  { name: 'رابع أ', floor: 4, id: 11, capacity: 30, tags: ['ps'] },
  { name: 'رابع ب', floor: 4, id: 12, capacity: 30, tags: ['ps'] },
  { name: 'رابع ج', floor: 4, id: 13, capacity: 0, tags: [] },
  { name: 'رابع د', floor: 4, id: 14, capacity: 0, tags: [] },
];

export const floors = [
  { id: 1, name: 'الرعاية المركزة' },
  { id: 2, name: 'الدور الثاني' },
  { id: 3, name: 'الدور الثالث' },
  { id: 4, name: 'الدور الرابع' },
];

export const id_doc_type_list = [
  { name: 'رقم قومي', id: 1 },
  { name: 'جواز سفر', id: 2 },
  { name: 'هوية وطنية', id: 3 },
  { name: 'بطاقة لجوء', id: 4 },
  { name: 'رخصة إقامة', id: 5 },
  { name: 'بدون', id: 6 },
];

export const discharge_reason_list = [
  { name: 'تحسن', id: 1 },
  { name: 'حسب الطلب', id: 2 },
  { name: 'تحويل لمستشفى آخر', id: 3 },
  { name: 'وفاة', id: 4 },
  { name: 'هروب', id: 5 },
  { name: 'سوء سلوك', id: 6 },
  { name: 'إلغاء حجز', id: 7 },
  { name: 'نقل إلى مساكن العبور', id: 8 },
  { name: 'أخرى', id: 9 },
];

export const dosage_unit_list = [
  { name: 'قرص', id: 1 },
  { name: 'كبسول', id: 2 },
  { name: 'أمبول', id: 3 },
  { name: 'فيال', id: 4 },
  { name: 'سرنجة', id: 5 },
  { name: 'كاربولة', id: 6 },
  { name: 'زجاجة', id: 7 },
  { name: 'بخاخة', id: 8 },
  { name: 'قطرة', id: 9 },
  { name: 'لاصقة', id: 10 },
  { name: 'أنبوبة', id: 11 },
  { name: 'كيس', id: 12 },
  { name: 'شريحة', id: 13 },
  { name: 'علبة', id: 14 },
];

export const stock_category_list = [
  { name: 'أقراص/كبسولات', id: 1 },
  { name: 'حقن', id: 2 },
  { name: 'مضاد حيوي', id: 3 },
  { name: 'مستنشقات', id: 4 },
  { name: 'محاليل', id: 5 },
  { name: 'مهدئات/مخدرات', id: 6 },
  { name: 'أشربة', id: 7 },
  { name: 'مكملات غذائية', id: 8 },
  { name: 'منوعات', id: 9 },
];

export const provinceCodesInNationalId = {
  '01': 'القاهرة',
  '02': 'الإسكندرية',
  '03': 'بورسعيد',
  '04': 'السويس',
  '11': 'دمياط',
  '12': 'الدقهلية',
  '13': 'الشرقية',
  '14': 'القليوبية',
  '15': 'كفر الشيخ',
  '16': 'الغربية',
  '17': 'المنوفية',
  '18': 'البحيرة',
  '19': 'الإسماعيلية',
  '21': 'الجيزة',
  '22': 'بني سويف',
  '23': 'الفيوم',
  '24': 'المنيا',
  '25': 'أسيوط',
  '26': 'سوهاج',
  '27': 'قنا',
  '28': 'أسوان',
  '29': 'الأقصر',
  '31': 'البحر الأحمر',
  '32': 'الوادي الجديد',
  '33': 'مطروح',
  '34': 'شمال سيناء',
  '35': 'جنوب سيناء',
  '88': 'خارج الجمهورية',
};
