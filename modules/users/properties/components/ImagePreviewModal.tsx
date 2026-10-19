import { View, Modal, Image, Pressable, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { icons } from "@/assets";
type ImagePreviewModalProps = {
  image: string;
  onClose: () => void;
};

export const ImagePreviewModal = ({
  image,
  onClose,
}: ImagePreviewModalProps) => {
  const insets = useSafeAreaInsets();
  return (
    <Modal onRequestClose={onClose} animationType="fade">
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Pressable 
        accessibilityRole="button"
        accessibilityLabel="Cerrar imagen"
        style={styles.exitButton}
        onPress={onClose}>
        <icons.BackButton />
      </Pressable>
      <Image
        style={styles.image}
        resizeMode='contain'
        source={{ uri: image }}
      />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
    paddingHorizontal: 15,
  },
  image: {
    flex: 1,
    width: "100%",
  },
  exitButton:{
    alignSelf: "flex-start",
    paddingHorizontal: 15,
    paddingVertical: 10
  }
});
