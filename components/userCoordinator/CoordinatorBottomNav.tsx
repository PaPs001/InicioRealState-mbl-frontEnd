import { Flag, Home, Users } from 'lucide-react-native'

import { BottomNav, type BottomNavItem } from '@/components/navigation/BottomNav'

const coordinatorBottomNavItems: BottomNavItem[] = [
  {
    key: 'properties',
    href: '/userCoordinator/properties-list',
    icon: (color, size) => <Users size={size} color={color} />,
    isActive: (pathname) =>
      pathname.startsWith('/userCoordinator/properties') ||
      pathname.startsWith('/userCoordinator/developments-soon'),
    label: 'Propiedades',
    size: 24,
  },
  {
    key: 'home',
    href: '/userCoordinator',
    icon: (color, size) => <Home size={size} color={color} />,
    isActive: (pathname) => pathname === '/userCoordinator' || pathname === '/userCoordinator/',
    label: 'Inicio',
    size: 27,
  },
  {
    key: 'leads',
    href: '/userCoordinator/leads',
    icon: (color, size) => <Flag size={size} color={color} />,
    isActive: (pathname) =>
      pathname.startsWith('/userCoordinator/leads'),
    label: 'Seguimiento',
    size: 24,
  },
]

export function CoordinatorBottomNav() {
  return <BottomNav defaultActiveIndex={1} items={coordinatorBottomNavItems} />
}
