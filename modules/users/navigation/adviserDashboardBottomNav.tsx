import {Date, Home, Lead, Message, Propertie} from '@/assets/index'

import { BottomNav, type BottomNavItem } from '@/components/navigation/BottomNav'
import { Users } from 'lucide-react-native'

const adviserDashboardBottomNavItems: BottomNavItem[] = [
  {
    key: 'properties',
    href: '../properties/screens/PropertiesScreen.tsx',
    icon: (color, size) => <Propertie />,
    isActive: (pathname) =>
      pathname.startsWith('../properties/screens/PropertiesScreen.tsx') ||
      pathname.startsWith('../properties/screens/PropertiesScreen.tsx'),
    label: 'Propiedades',
    size: 24,
  },
  {
    key: 'home',
    href: '/userAdviser',
    icon: (color, size) => <Home/>,
    isActive: (pathname) => pathname === '/userAdviser' || pathname === '/userAdviser/',
    label: 'Inicio',
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
]

export function AdviserDashboardBottomNav(){
  return <BottomNav
    defaultActiveIndex={1} items={adviserDashboardBottomNavItems}
  />
}
