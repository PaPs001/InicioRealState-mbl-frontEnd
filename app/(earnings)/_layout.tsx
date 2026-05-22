import { Stack } from 'expo-router'

export default function EarningsLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="earnings" />
      <Stack.Screen name="campaigns" />
    </Stack>
  )
}
