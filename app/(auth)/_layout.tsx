import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="login-new" />
      <Stack.Screen name="register-new" />
      <Stack.Screen name="register-owner" />
      <Stack.Screen name="register-owner-access" />
      <Stack.Screen name="register-owner-verify" />
      <Stack.Screen name="register-owner-welcome" />
      <Stack.Screen name="register-owner-profile" />
      <Stack.Screen name="register-owner-final" />
      <Stack.Screen name="register" />
      <Stack.Screen name="create-account" />
      <Stack.Screen name="logout-transition" />
      <Stack.Screen name="register-transition" />
    </Stack>
  )
}
