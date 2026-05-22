import { Stack } from 'expo-router'

export default function CatalogLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="catalog" />
      <Stack.Screen name="favorites" />
    </Stack>
  )
}
