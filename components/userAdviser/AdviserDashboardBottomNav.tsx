import { Flag, Home, Users } from 'lucide-react-native'

import { BottomNav, type BottomNavItem } from '@/components/navigation/BottomNav'

const adviserDashboardBottomNavItems: BottomNavItem[] = [
  {
    key: 'properties',
    href: '/userAdviser/properties-list',
    icon: (color, size) => <Users size={size} color={color} />,
    isActive: (pathname) =>
      pathname.startsWith('/userAdviser/properties') ||
      pathname.startsWith('/userAdviser/developments-soon'),
    label: 'Propiedades',
    size: 24,
  },
  {
    key: 'home',
    href: '/userAdviser',
    icon: (color, size) => <Home size={size} color={color} />,
    isActive: (pathname) => pathname === '/userAdviser' || pathname === '/userAdviser/',
    label: 'Inicio',
    size: 27,
  },
  {
    key: 'leads',
    href: '/userAdviser/leads',
    icon: (color, size) => <Flag size={size} color={color} />,
    isActive: (pathname) =>
      pathname.startsWith('/userAdviser/leads'),
    label: 'Seguimiento',
    size: 24,
  },
]

export function AdviserDashboardBottomNav() {
  return <BottomNav defaultActiveIndex={1} items={adviserDashboardBottomNavItems} />
}
