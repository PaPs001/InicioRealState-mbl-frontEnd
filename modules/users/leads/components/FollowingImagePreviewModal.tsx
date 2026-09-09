import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { X } from "lucide-react-native";

import type { FollowingImagePreview } from "./FollowingImageAttachment";
import { ScrollView } from "react-native";
import { useState } from "react";

type Props = {
  image?: FollowingImagePreview | null;
  images?: FollowingImagePreview[];
  onClose: () => void;
};

export function FollowingImagePreviewModal({ image, images, onClose }: Props) {
  const galleryImages = images?.length ? images : image ? [image] : [];
  const { height, width } = useWindowDimensions();
  const imageWidth = width - 28;
  const imageHeight = Math.max(height - 150, 1);
  const [activeIndex, setActiveIndex] = useState(0)

  const activeImage = galleryImages[activeIndex] || galleryImages[0]
  return (
    <Modal
      animationType="fade"
      transparent
      visible={galleryImages.length > 0}
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.header}>
          <Text style={styles.title} numberOfLines={1}>
            {activeImage?.title || "Imagen adjunta"}
          </Text>
          <TouchableOpacity
            style={styles.closeButton}
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Cerrar imagen"
            onPress={onClose}
          >
            <X size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
        {galleryImages.length > 0 ? (
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            style={styles.gallery}
            contentContainerStyle={styles.galleryContent}
            onMomentumScrollEnd={(event) => {
              const nextIndex = Math.round(
                event.nativeEvent.contentOffset.x / imageWidth,
              )
              setActiveIndex(nextIndex)
            }}
          >
            {galleryImages.map((galleryImage, index) => (
              <Image
                key={`${galleryImage.uri}-${index}`}
                source={{ uri: galleryImage.uri }}
                style={[styles.image, { width: imageWidth, height: imageHeight }]}
                resizeMode="contain"
              />
            ))}
          </ScrollView>
        ) : null}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.88)",
    paddingHorizontal: 14,
    paddingTop: 46,
    paddingBottom: 28,
  },
  header: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  title: {
    flex: 1,
    minWidth: 0,
    color: "#ffffff",
    fontSize: 14,
    lineHeight: 18,
    fontWeight: "700",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  gallery: { flex: 1 },
  galleryContent: { alignItems: "center" },
  image: {},
});
