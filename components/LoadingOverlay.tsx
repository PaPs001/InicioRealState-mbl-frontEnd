import { ActivityIndicator, Modal, StyleSheet, Text, View } from "react-native";

import { generalColors } from "@/theme";

type LoadingOverlayProps = {
  visible: boolean;
  message?: string;
};

export function LoadingOverlay({
  visible,
  message = "Cargando...",
}: LoadingOverlayProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={() => {}}
    >
      <View
        style={styles.overlay}
        onStartShouldSetResponder={() => true}
        accessibilityViewIsModal
        accessible
        accessibilityRole="progressbar"
        accessibilityLabel={message || "Cargando"}
        accessibilityState={{ busy: true }}
      >
        <ActivityIndicator size="large" color={generalColors.greenTitle} />
        {message ? <Text style={styles.message}>{message}</Text> : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.65)",
    padding: 24,
  },
  message: {
    marginTop: 12,
    color: generalColors.greenTitle,
    fontSize: 16,
    textAlign: "center",
  },
});
