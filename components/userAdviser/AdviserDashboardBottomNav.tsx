import { Date, Home, Lead, Propertie } from '@/assets/'

import { BottomNav, type BottomNavItem } from '@/components/navigation/BottomNav'

const adviserDashboardBottomNavItems: BottomNavItem[] = [
  {
    key: 'properties',
    href: '/userAdviser/properties-list',
    icon: (color, size) => <Propertie/>,
    isActive: (pathname) =>
      pathname.startsWith('/userAdviser/properties'),
    label: 'Propiedades',
    size: 24,
  },
  {
    key: 'home',
    href: '/userAdviser',
    icon: (color, size) => <Home/>,
    isActive: (pathname) => pathname === '/userAdviser' || pathname === '/userAdviser/',
    label: '',
    size: 27,
  },
  {
    key: 'leads',
    href: '/userAdviser/leads',
    icon: (color, size) => <Lead/>,
    isActive: (pathname) =>
      pathname.startsWith('/userAdviser/leads'),
    label: 'Seguimiento',
    size: 24,
  },
  /*{
    key: 'dates',
    href: '/userAdviser/date',
    icon: (color, size) => <Date width={size} height={size} />,
    isActive: (pathname) =>
      pathname.startsWith('/userAdviser/date'),
    label: 'Calendario',
    size: 24,
  }*/
]

export function AdviserDashboardBottomNav() {
  return <BottomNav defaultActiveIndex={1} items={adviserDashboardBottomNavItems} />
}
