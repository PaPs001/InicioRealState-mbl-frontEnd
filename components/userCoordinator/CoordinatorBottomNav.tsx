import { CalendarDays, Flag, Home, MessageCircle, Users } from 'lucide-react-native'

import { BottomNav, type BottomNavItem } from '@/components/navigation/BottomNav'

const coordinatorBottomNavItems: BottomNavItem[] = [
  {
    key: 'properties',
    href: '/userCoordinator/properties',
    icon: (color, size) => <Users size={size} color={color} />,
    isActive: (pathname) =>
      pathname.startsWith('/userCoordinator/properties') ||
      pathname.startsWith('/userCoordinator/developments-soon'),
    label: 'Propiedades',
    size: 24,
  },
  {
    key: 'appointments',
    href: '/userCoordinator/appointments',
    icon: (color, size) => <CalendarDays size={size} color={color} />,
    label: 'Citas',
    size: 25,
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
    href: '/userCoordinator/rent-followups',
    icon: (color, size) => <Flag size={size} color={color} />,
    isActive: (pathname) =>
      pathname.startsWith('/userCoordinator/rent-followups') ||
      pathname.startsWith('/userCoordinator/leads'),
    label: 'Seguimiento',
    size: 24,
  },
  {
    key: 'messages',
    href: '/userCoordinator/messages',
    icon: (color, size) => <MessageCircle size={size} color={color} />,
    label: 'Mensajes',
    size: 24,
  },
]

export function CoordinatorBottomNav() {
  return <BottomNav defaultActiveIndex={2} items={coordinatorBottomNavItems} />
}
