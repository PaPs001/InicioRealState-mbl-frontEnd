import { Tabs } from 'expo-router'
import { AdviserDashboardBottomNav } from '@/components/userAdviser/AdviserDashboardBottomNav'
import { CalendarDataProvider } from '@/modules/users/date/context/CalendarDataContext'

export default function AdviserLayout() {
  return (
    <CalendarDataProvider>
      <Tabs
        tabBar={() => <AdviserDashboardBottomNav />}
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' },
          sceneStyle: { backgroundColor: '#ffffff' },
          lazy: true,
        }}
      >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="leads" options={{ title: 'Seguimiento' }} />
      <Tabs.Screen name="leads-v2" options={{ title: 'Seguimiento V2', href: null }} />
      <Tabs.Screen name="leads-v2/followups" options={{ title: 'Historial V2', href: null }} />
      <Tabs.Screen name="properties-list" options={{ title: 'Listado', href: null }} />
      <Tabs.Screen name="properties.v2" options={{ title: 'Propiedades V2', href: null }} />
      <Tabs.Screen name="date" options={{ title: 'Calendario' }} />
      <Tabs.Screen name="settings" options={{ title: 'Configuración', href: null }} />
      <Tabs.Screen name="development-list" options={{ title: 'Desarrollos', href: null }} />
      </Tabs>
    </CalendarDataProvider>
  )
}
