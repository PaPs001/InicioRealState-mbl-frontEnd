import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { generalColors, userColors } from "@/theme";

export function MapLoadingIndicator() {
  return (
    <View pointerEvents="none" style={styles.container}>
      <View
        style={styles.badge}
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel="Cargando propiedades"
        accessibilityState={{ busy: true }}
        accessibilityLiveRegion="polite"
      >
        <ActivityIndicator size="small" color={userColors.adviser.primary} />
        <Text style={styles.text}>Cargando propiedades…</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 16,
    left: 16,
    right: 16,
    alignItems: "center",
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 24,
    backgroundColor: generalColors.background,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  text: {
    flexShrink: 1,
    color: userColors.adviser.primary,
    fontSize: 14,
    fontWeight: "600",
  },
});
