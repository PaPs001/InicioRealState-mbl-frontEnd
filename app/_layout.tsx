import { Stack } from 'expo-router'
import { AuthProvider } from '@/contexts/AuthContext'
import * as NavigationBar from 'expo-navigation-bar'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import { colors } from '@/lib/theme'
import { ThemeProvider, DefaultTheme } from '@react-navigation/native'

const navigationTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.primaryDark,
    card: colors.primaryDark,
    border: colors.primaryDark,
    primary: colors.accent,
    text: colors.textLight,
  },
}

export default function RootLayout(){
  useEffect(() => {
    NavigationBar.setBackgroundColorAsync(colors.primaryDark);
    NavigationBar.setButtonStyleAsync('light');
    NavigationBar.setVisibilityAsync('hidden');
    NavigationBar.setBehaviorAsync('overlay-swipe');
    
  }, []);

  return (
    <AuthProvider>
      <ThemeProvider value={navigationTheme}>
        <StatusBar hidden={true} style="light" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.primaryDark },
            animation: 'none',
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
              contentStyle: { backgroundColor: colors.primaryDark },
            }} 
          />
        </Stack>
      </ThemeProvider>
    </AuthProvider>
  )
}
