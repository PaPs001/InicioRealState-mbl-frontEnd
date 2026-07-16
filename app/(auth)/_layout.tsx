import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login/login" />
      <Stack.Screen name="register-new" />
      <Stack.Screen name="register" />
      <Stack.Screen name="register-transition" />
      <Stack.Screen name="password" />
      <Stack.Screen name="(register)/regAdvisor" />
      <Stack.Screen name="(register)/regCoordinator" />
      <Stack.Screen name="(register)/regCoordinator-new" />
      <Stack.Screen name="(register)/regInquilino" />
      <Stack.Screen name="(register)/regOwnerHouse" />
      <Stack.Screen name="(register)/regSearcher" />
    </Stack>
  )
}

