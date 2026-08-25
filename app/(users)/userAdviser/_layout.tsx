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
      <Tabs.Screen name="properties" options={{ title: 'Propiedades' }} />
      <Tabs.Screen name="appointments" options={{ title: 'Citas' }} />
      <Tabs.Screen name="leads" options={{ title: 'Seguimiento' }} />
      <Tabs.Screen name="leads-v2" options={{ title: 'Seguimiento V2', href: null }} />
      <Tabs.Screen name="leads-v2/followups" options={{ title: 'Historial V2', href: null }} />
      <Tabs.Screen name="messages" options={{ title: 'Mensajes' }} />
      <Tabs.Screen name="properties-list" options={{ title: 'Listado', href: null }} />
      <Tabs.Screen name="properties.v2" options={{ title: 'Propiedades V2', href: null }} />
      <Tabs.Screen name="rent-followups" options={{ title: 'Seguimientos Rentas', href: null }} />
      <Tabs.Screen name="developments-soon" options={{ title: 'Desarrollos', href: null }} />
      <Tabs.Screen name="date" options={{ title: 'Calendario' }} />
      <Tabs.Screen name="settings" options={{ title: 'Configuración', href: null }} />
      <Tabs.Screen name="mainDashboard" options={{ title: 'Dashboard', href: null }} />
      </Tabs>
    </CalendarDataProvider>
  )
}
