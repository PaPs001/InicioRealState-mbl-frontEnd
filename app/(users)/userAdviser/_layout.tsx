import { Tabs } from 'expo-router'
import { AdviserDashboardBottomNav } from '@/components/userAdviser/AdviserDashboardBottomNav'

export default function AdviserLayout() {
  return (
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
      <Tabs.Screen name="messages" options={{ title: 'Mensajes' }} />
      <Tabs.Screen name="properties-list" options={{ title: 'Listado', href: null }} />
      <Tabs.Screen name="rent-followups" options={{ title: 'Seguimientos Rentas', href: null }} />
      <Tabs.Screen name="developments-soon" options={{ title: 'Desarrollos', href: null }} />
    </Tabs>
  )
}
