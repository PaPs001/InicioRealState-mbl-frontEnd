import { Stack } from 'expo-router'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import * as NavigationBar from 'expo-navigation-bar'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { colors, clientThemes } from '@/lib/theme'
import { ThemeProvider, DefaultTheme } from '@react-navigation/native'
import { Platform, View } from 'react-native'

// Componente interno que tiene acceso al contexto de auth
function RootNavigator() {
  const { currentUser, isClient } = useAuth()
  
  // Determinar si es inversionista
  const isInvestor = currentUser?.role === 'investor'
  
  // Color de fondo basado en el tipo de usuario
  const backgroundColor = isInvestor ? clientThemes.investor.background : colors.primaryDark
  
  const navigationTheme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      background: backgroundColor,
      card: backgroundColor,
      border: backgroundColor,
      primary: isInvestor ? clientThemes.investor.accent : colors.accent,
      text: isInvestor ? clientThemes.investor.text : colors.textLight,
    },
  }

  useEffect(() => {
    const setupNavigationBar = async () => {
      try {
        if (Platform.OS === 'android') {
          await NavigationBar.setBackgroundColorAsync(backgroundColor);
          await NavigationBar.setButtonStyleAsync('light');
          await NavigationBar.setVisibilityAsync('hidden');
          await NavigationBar.setBehaviorAsync('overlay-swipe');
        }
      } catch (error) {
        // Navigation bar setup error - non-fatal, continue
      }
    }
    setupNavigationBar()
  }, [backgroundColor]);

  return (
    <ThemeProvider value={navigationTheme}>
      <View style={{ flex: 1, backgroundColor }}>
        <StatusBar hidden={true} style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor },
            animation: 'fade',
            animationDuration: 150,
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="(tabs)" />
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
