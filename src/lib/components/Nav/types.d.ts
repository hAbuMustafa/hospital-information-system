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
