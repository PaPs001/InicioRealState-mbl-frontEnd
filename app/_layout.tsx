import { Stack, usePathname } from 'expo-router'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import * as NavigationBar from 'expo-navigation-bar'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { colors, clientThemes } from '@/lib/theme'
import { ThemeProvider, DefaultTheme } from '@react-navigation/native'
import { Platform, View } from 'react-native'

// Componente interno que tiene acceso al contexto de auth
function RootNavigator() {
  const { currentUser, authToken, isClient } = useAuth()
  const pathname = usePathname()
  
  // Determinar tipo de usuario
  const userRole = currentUser?.role
  const isInvestor = userRole === 'investor'
  const isAdvisor = userRole === 'advisor' || userRole === 'coordinator'
  
  // Usuarios con fondo oscuro: inversionista y asesor
  // Usuarios con fondo claro: searching, tenant, y sin usuario (login/registro)
  const isDarkTheme = isInvestor || isAdvisor
  
  // Color de fondo basado en el tipo de usuario
  let backgroundColor = colors.background // Default claro para login/registro
  
  if (currentUser) {
    if (isInvestor) {
      backgroundColor = clientThemes.investor.background
    } else if (isAdvisor) {
      backgroundColor = clientThemes.advisor.background
    } else if (userRole === 'tenant') {
      backgroundColor = clientThemes.tenant.background
    } else if (userRole === 'searching') {
      backgroundColor = clientThemes.searching.background
    } else {
      backgroundColor = colors.background
    }
  }
  
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: backgroundColor,
      card: backgroundColor,
      border: backgroundColor,
      primary: isInvestor ? clientThemes.investor.accent : isAdvisor ? clientThemes.advisor.accent : colors.accent,
      text: isDarkTheme ? colors.textLight : colors.text,
    },
  }

  useEffect(() => {
    const setupNavigationBar = async () => {
      try {
        if (Platform.OS === 'android') {
          await NavigationBar.setBackgroundColorAsync(backgroundColor);
          await NavigationBar.setButtonStyleAsync(isDarkTheme ? 'light' : 'dark');
          await NavigationBar.setVisibilityAsync('hidden');
          await NavigationBar.setBehaviorAsync('overlay-swipe');
        }
      } catch (error) {
        // Navigation bar setup error - non-fatal, continue
      }
    }
    setupNavigationBar()
  }, [backgroundColor, isDarkTheme]);

  useEffect(() => {
    const tokenPreview = authToken ? `${authToken.slice(0, 12)}...` : 'SIN_TOKEN'
    console.log('[auth][route]', {
      pathname,
      userId: currentUser?.id ?? null,
      role: currentUser?.role ?? null,
      token: tokenPreview,
      hasToken: !!authToken,
    })
  }, [pathname, authToken, currentUser?.id, currentUser?.role])

  return (
    <ThemeProvider value={navigationTheme}>
      <View style={{ flex: 1, backgroundColor }}>
        <StatusBar hidden={true} style={isDarkTheme ? 'light' : 'dark'} />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor },
            animation: 'fade',
            animationDuration: 150,
          }}
        >
          <Stack.Screen 
            name="index" 
            options={{ 
              contentStyle: { backgroundColor: clientThemes.investor.background },
            }} 
          />
          <Stack.Screen 
            name="login" 
            options={{ 
              contentStyle: { backgroundColor: colors.background },
            }} 
          />
          <Stack.Screen 
            name="create-account" 
            options={{ 
              contentStyle: { backgroundColor: colors.background },
            }} 
          />
          <Stack.Screen 
            name="registerScreen" 
            options={{ 
              contentStyle: { backgroundColor: colors.background },
            }} 
          />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen 
            name="logout-transition" 
            options={{ 
              contentStyle: { backgroundColor: clientThemes.investor.background },
            }} 
          />
          <Stack.Screen 
            name="property/[id]" 
            options={{ 
              headerShown: true,
              headerTitle: 'Detalle de Propiedad',
              presentation: 'modal',
              contentStyle: { backgroundColor },
            }} 
          />
          <Stack.Screen 
            name="my-properties-screen" 
            options={{ 
              contentStyle: { backgroundColor },
            }} 
          />
          <Stack.Screen 
            name="add-property-screen" 
            options={{ 
              contentStyle: { backgroundColor },
            }} 
          />
          <Stack.Screen 
            name="property-detail-screen" 
            options={{ 
              contentStyle: { backgroundColor },
            }} 
          />
          <Stack.Screen 
            name="list-property-screen" 
            options={{ 
              contentStyle: { backgroundColor },
            }} 
          />
          <Stack.Screen 
            name="earnings-screen" 
            options={{ 
              contentStyle: { backgroundColor },
            }} 
          />
          <Stack.Screen 
            name="catalog-screen" 
            options={{ 
              contentStyle: { backgroundColor },
            }} 
          />
          <Stack.Screen 
            name="favorites-screen" 
            options={{ 
              contentStyle: { backgroundColor },
            }} 
          />
          <Stack.Screen 
            name="appointments-screen" 
            options={{ 
              contentStyle: { backgroundColor },
            }} 
          />
          <Stack.Screen 
            name="notifications-screen" 
            options={{ 
              contentStyle: { backgroundColor },
            }} 
          />
          <Stack.Screen 
            name="campaigns-screen" 
            options={{ 
              contentStyle: { backgroundColor },
            }} 
          />
        </Stack>
      </View>
    </ThemeProvider>
  )
}

export default function RootLayout(){
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  )
}
