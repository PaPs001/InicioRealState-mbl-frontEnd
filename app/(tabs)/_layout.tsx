//imagenes
import CalendarDateIcon from '../assets/calendarDatesIconMobile.svg'
import CatalogIcon from '../assets/catalogIconMobile.svg'
import FavoritesIcon from '../assets/favoritesIconMobile.svg'
import HomeIcon from '../assets/homeIconMobile.svg'
import LeadsIcon from '../assets/leadsIconMobile.svg'
import ProfileIcon from '../assets/profileIconMobile.svg'
import RegistryIcon from '../assets/RegistryIconMobile.svg'

import { Tabs } from 'expo-router'
import { useAuth } from '@/contexts/AuthContext'
import { colors, clientThemes, ClientRole } from '@/lib/theme'
import { 
  Home, 
  Search, 
  Calendar, 
  Heart, 
  User,
  Users,
  Building2,
  ClipboardCheck,
  Wallet,
  MessageCircle,
} from 'lucide-react-native'

export default function TabsLayout() {
  const { isAgent, isAdmin, isClient, currentUser } = useAuth()
  
  const getClientRole = (): ClientRole => {
    if (currentUser?.role === 'investor') return 'investor'
    if (currentUser?.role === 'tenant') return 'tenant'
    return 'searching'
  }
  const clientTheme = isClient ? clientThemes[getClientRole()] : null
  
  const isInvestor = currentUser?.role === 'investor'
  const tabBarBg = isClient && clientTheme ? clientTheme.surface : colors.primaryDark
  const tabBarActive = isInvestor ? clientTheme?.accent : (isClient && clientTheme ? clientTheme.primary : colors.accent)
  const tabBarInactive = isClient && clientTheme ? clientTheme.textMuted : colors.textMuted
  const headerBg = isClient && clientTheme ? clientTheme.primary : colors.primaryDark
  const tabBarBorder = isClient && clientTheme ? clientTheme.border : colors.borderDark
  const sceneBg = isClient && clientTheme ? clientTheme.background : colors.primaryDark

  const renderTabIcon = (routeName: string, size: number, color: string) => {
    switch (routeName) {
      case 'index':
        return <HomeIcon width={size} height={size} fill={color} />
      case 'catalog':
        return <CatalogIcon width={size} height={size} fill={color} />
      case 'appointments':
        return <CalendarDateIcon width={size} height={size} fill={color} />
      case 'favorites':
        return <FavoritesIcon width={size} height={size} fill={color} />
      case 'leads':
        return <LeadsIcon width={size} height={size} fill={color} />
      case 'registration':
        return <RegistryIcon width={size} height={size} fill={color} />
      case 'profile':
        return <ProfileIcon width={size} height={size} fill={color} />
      case 'properties':
        return <Building2 size={size} color={color} />
      case 'reviews':
        return <ClipboardCheck size={size} color={color} />
      case 'commissions':
        return <Wallet size={size} color={color} />
      case 'messages':
        return <MessageCircle size={size} color={color} />
      default:
        return <Home size={size} color={color} />
    }
  }

  return (
    <Tabs
      sceneContainerStyle={{ backgroundColor: sceneBg }}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: tabBarActive,
        tabBarInactiveTintColor: tabBarInactive,
        tabBarStyle: {
          backgroundColor: tabBarBg,
          borderTopColor: tabBarBorder,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: headerBg,
        },
        headerTintColor: colors.textInverse,
        headerShown: false,
        tabBarIcon: ({ color, size }) => renderTabIcon(route.name, size, color),
      })}
    >
      {/* Pantallas para clientes - Inicio, Mensajes y Perfil */}
      {isClient && (
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Inicio',
            }}
          />
          <Tabs.Screen
            name="messages"
            options={{
              title: 'Mensajes',
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Perfil',
            }}
          />
        </>
      )}

      {/* Pantallas para asesores */}
      {isAgent && (
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Inicio',
            }}
          />
          <Tabs.Screen
            name="messages"
            options={{
              title: 'Mensajes',
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Perfil',
            }}
          />
        </>
      )}

      {/* Pantallas para coordinadores */}
      {isAdmin && (
        <>
          <Tabs.Screen
            name="index"
            options={{
              title: 'Panel',
            }}
          />
          <Tabs.Screen
            name="leads"
            options={{
              title: 'Leads',
            }}
          />
          <Tabs.Screen
            name="reviews"
            options={{
              title: 'Revisar',
            }}
          />
          <Tabs.Screen
            name="commissions"
            options={{
              title: 'Comisiones',
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Perfil',
            }}
          />
        </>
      )}

      {/* Ocultar tabs no usadas */}
      <Tabs.Screen name="catalog" options={{ href: null }} />
      <Tabs.Screen name="appointments" options={{ href: null }} />
      <Tabs.Screen name="favorites" options={{ href: null }} />
      <Tabs.Screen name="messages" options={{ href: isClient || isAgent ? undefined : null }} />
      <Tabs.Screen name="leads" options={{ href: isAdmin ? undefined : null }} />
      <Tabs.Screen name="properties" options={{ href: null }} />
      <Tabs.Screen name="registration" options={{ href: null }} />
      <Tabs.Screen name="reviews" options={{ href: isAdmin ? undefined : null }} />
      <Tabs.Screen name="commissions" options={{ href: isAdmin ? undefined : null }} />
    </Tabs>
  )
}
