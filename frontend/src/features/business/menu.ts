export interface MenuItem {
  label: string
  roles: Array<'admin' | 'supervisor' | 'employee'>
}

const MENU_ITEMS: MenuItem[] = [{ label: 'Resumen', roles: ['admin', 'supervisor', 'employee'] }]

export function menuForRole(role: 'admin' | 'supervisor' | 'employee' | undefined) {
  return MENU_ITEMS.filter((item) => role && item.roles.includes(role))
}
