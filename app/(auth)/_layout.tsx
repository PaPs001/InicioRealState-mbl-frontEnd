import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="register" />
      <Stack.Screen name="create-account" />
      <Stack.Screen name="logout-transition" />
      <Stack.Screen name="register-transition" />
    </Stack>
  )
}
