import { Stack } from 'expo-router'

export default function PropertiesLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="add-property" />
      <Stack.Screen name="my-properties" />
      <Stack.Screen name="property-detail" />
      <Stack.Screen name="list-property" />
      <Stack.Screen name="my-rental" />
    </Stack>
  )
}
