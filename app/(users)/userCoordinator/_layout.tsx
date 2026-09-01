import { Component, type ReactNode } from 'react'
import { Text, View } from 'react-native'
import { Tabs } from 'expo-router'
import { CoordinatorBottomNav } from '@/components/userCoordinator/CoordinatorBottomNav'
import { CalendarDataProvider } from '@/modules/users/date/context/CalendarDataContext'

type CoordinatorErrorBoundaryState = {
  errorMessage: string | null
}

class CoordinatorErrorBoundary extends Component<{ children: ReactNode }, CoordinatorErrorBoundaryState> {
  state: CoordinatorErrorBoundaryState = {
    errorMessage: null,
  }

  static getDerivedStateFromError(error: unknown): CoordinatorErrorBoundaryState {
    return {
      errorMessage: error instanceof Error ? error.message : 'Error desconocido en el panel de coordinador',
    }
  }

  componentDidCatch(error: unknown) {
    console.error('[coordinator][render-error]', error)
  }

  render() {
    if (this.state.errorMessage) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#ffffff' }}>
          <Text style={{ color: '#3d5a40', fontSize: 18, fontWeight: '700', marginBottom: 8 }}>
            No se pudo abrir el panel
          </Text>
          <Text style={{ color: '#333333', fontSize: 13, lineHeight: 18 }}>
            {this.state.errorMessage}
          </Text>
        </View>
      )
    }

    return this.props.children
  }
}

export default function CoordinatorLayout() {
  return (
    <CoordinatorErrorBoundary>
      <CalendarDataProvider>
        <Tabs
          tabBar={() => <CoordinatorBottomNav />}
          screenOptions={{
            headerShown: false,
            tabBarStyle: { display: 'none' },
            sceneStyle: { backgroundColor: '#ffffff' },
            lazy: true,
          }}
        >
        <Tabs.Screen name="index" options={{ title: 'Inicio' }} />
        <Tabs.Screen name="date" options={{ title: 'Calendario' }} />
        <Tabs.Screen name="leads" options={{ title: 'Seguimiento' }} />
        <Tabs.Screen name="leads-v2" options={{ title: 'Seguimiento V2', href: null }} />
        <Tabs.Screen name="leads-v2/followups" options={{ title: 'Historial V2', href: null }} />
        <Tabs.Screen name="properties-list" options={{ title: 'Listado', href: null }} />
        <Tabs.Screen name="settings" options={{ title: 'Configuración', href: null }} />
        </Tabs>
      </CalendarDataProvider>
    </CoordinatorErrorBoundary>
  )
}
