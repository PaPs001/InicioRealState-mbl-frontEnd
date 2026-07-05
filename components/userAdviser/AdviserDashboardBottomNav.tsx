import { CalendarDays, Flag, Home, MessageCircle, Users } from 'lucide-react-native'

import { BottomNav, type BottomNavItem } from '@/components/navigation/BottomNav'

const adviserDashboardBottomNavItems: BottomNavItem[] = [
  {
    key: 'properties',
    href: '/userAdviser/properties',
    icon: (color, size) => <Users size={size} color={color} />,
    isActive: (pathname) =>
      pathname.startsWith('/userAdviser/properties') ||
      pathname.startsWith('/userAdviser/developments-soon'),
    label: 'Propiedades',
    size: 24,
  },
  {
    key: 'appointments',
    href: '/userAdviser/appointments',
    icon: (color, size) => <CalendarDays size={size} color={color} />,
    label: 'Citas',
    size: 25,
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
    href: '/userAdviser/rent-followups',
    icon: (color, size) => <Flag size={size} color={color} />,
    isActive: (pathname) =>
      pathname.startsWith('/userAdviser/rent-followups') ||
      pathname.startsWith('/userAdviser/leads'),
    label: 'Seguimiento',
    size: 24,
  },
  {
    key: 'messages',
    href: '/userAdviser/messages',
    icon: (color, size) => <MessageCircle size={size} color={color} />,
    label: 'Mensajes',
    size: 24,
  },
]

export function AdviserDashboardBottomNav() {
  return <BottomNav defaultActiveIndex={2} items={adviserDashboardBottomNavItems} />
}
