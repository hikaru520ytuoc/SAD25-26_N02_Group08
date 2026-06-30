import type { ComponentType } from 'react';
import { getFlatMenuForRoles, hasAnyRole, isMenuItemActive, SIDEBAR_MENU_GROUPS } from './sidebar-menu';

export type MenuItem = {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  roles: string[];
  description?: string;
};

export const MENU_ITEMS: MenuItem[] = SIDEBAR_MENU_GROUPS.flatMap((group) =>
  group.items.map((item) => ({
    label: item.title,
    href: item.href,
    icon: group.icon,
    roles: item.roles,
  })),
);

export function getMenuForRoles(roles: string[]) {
  return getFlatMenuForRoles(roles).map((item) => ({
    label: item.title,
    href: item.href,
    icon: item.icon,
    roles: item.roles,
  }));
}

export function isPathAllowed(pathname: string, roles: string[]) {
  if (pathname === '/' || pathname === '/login' || pathname === '/dashboard' || pathname === '/profile') return true;
  const item = MENU_ITEMS.find((menuItem) => isMenuItemActive(pathname, menuItem.href));
  if (!item) return true;
  return hasAnyRole(roles, item.roles);
}
