import { Stack } from "expo-router";
import { CalendarDataProvider } from "@/modules/users/date/context/CalendarDataContext";

export default function UsersLayout() {
  return (
    <CalendarDataProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="userCoordinator" />
        <Stack.Screen name="userAdviser" />
        <Stack.Screen name="registration-complete" />
        <Stack.Screen name="selected-property" />
        <Stack.Screen name="testing-selected-property" />
        <Stack.Screen name="developments" />
      </Stack>
    </CalendarDataProvider>
  );
}
