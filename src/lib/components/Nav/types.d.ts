type MenuT = {
  label?: string;
  name?: string;
  links: NavLinkT[];
  separator_indices?: number[];
  permission?: PermissionT;
};

type PermissionT = { role: number[]; affiliation: number[] };

type NavLinkT = {
  href: string;
  label: string;
  permission?: PermissionT;
};
