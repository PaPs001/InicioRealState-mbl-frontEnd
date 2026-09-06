import { images } from "@/assets";
import { View, Modal, Text, Image, Pressable, StyleSheet } from "react-native";
import { icons } from "@/assets";
type ImagePreviewModalProps = {
  image: string;
  onClose: () => void;
};

export const ImagePreviewModal = ({
  image,
  onClose,
}: ImagePreviewModalProps) => {
  return (
    <Modal style={styles.container}>
      <Pressable 
        style={styles.exitButton}
        onPress={onClose}>
        <icons.BackButton />
      </Pressable>
      <Image
        style={{
          marginTop: 30,
          width: "100%",
          height: "100%",
          borderRadius: 15,
        }}
        resizeMode='cover'
        source={{ uri: image }}
      />
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 170,
    paddingHorizontal: 15,
  },
  exitButton:{
    paddingHorizontal: 15,
    paddingVertical: 10
  }
});
