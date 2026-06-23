import { Tabs } from 'expo-router'
import { CoordinatorBottomNav } from '@/components/coordinator/CoordinatorBottomNav'

export default function CoordinatorLayout() {
  return (
    <Tabs
      tabBar={() => <CoordinatorBottomNav />}
      screenOptions={{
        headerShown: false,
        tabBarStyle: { display: 'none' },
        sceneStyle: { backgroundColor: '#ffffff' },
        lazy: false,
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
      <Tabs.Screen name="properties" options={{ title: 'Propiedades' }} />
      <Tabs.Screen name="leads" options={{ title: 'Seguimiento' }} />
      <Tabs.Screen name="properties-list" options={{ title: 'Listado', href: null }} />
      <Tabs.Screen name="developments-soon" options={{ title: 'Desarrollos', href: null }} />
    </Tabs>
  )
}
