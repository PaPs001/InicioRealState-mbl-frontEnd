import { useState } from "react";
import { View, Modal, FlatList, Pressable, StyleSheet, Text } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { icons } from "@/assets";
import { PropertyImage } from "./selectedProperties/PropertyImage";

type ImagePreviewModalProps = {
  initialIndex?: number;
  onClose: () => void;
} & (
  | { images: string[]; image?: never }
  | { image: string; images?: never }
);

export const ImagePreviewModal = ({
  images: imageList,
  image,
  initialIndex = 0,
  onClose,
}: ImagePreviewModalProps) => {
  const images = imageList ?? [image];
  const insets = useSafeAreaInsets();
  const [pageWidth, setPageWidth] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.max(0, Math.min(initialIndex, images.length - 1)),
  );
  const safeIndex = Math.max(0, Math.min(currentIndex, images.length - 1));

  return (
    <Modal onRequestClose={onClose} animationType="fade">
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <View style={styles.header}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Cerrar imagen"
            style={styles.exitButton}
            onPress={onClose}
          >
            <icons.BackButton />
          </Pressable>
          <Text accessibilityLiveRegion="polite">
            {images.length ? safeIndex + 1 : 0} de {images.length}
          </Text>
        </View>
        <View
          style={styles.viewport}
          onLayout={({ nativeEvent }) => setPageWidth(nativeEvent.layout.width)}
        >
          {pageWidth > 0 && images.length > 0 && (
            <FlatList
              key={pageWidth}
              data={images}
              horizontal
              pagingEnabled
              initialScrollIndex={safeIndex}
              showsHorizontalScrollIndicator={false}
              keyExtractor={(_, index) => String(index)}
              getItemLayout={(_, index) => ({
                length: pageWidth,
                offset: pageWidth * index,
                index,
              })}
              onMomentumScrollEnd={({ nativeEvent }) => {
                setCurrentIndex(Math.max(0, Math.min(
                  Math.round(nativeEvent.contentOffset.x / pageWidth),
                  images.length - 1,
                )));
              }}
              renderItem={({ item, index }) => (
                <View style={{ width: pageWidth, height: "100%" }}>
                  <PropertyImage
                    uri={item}
                    style={styles.image}
                    resizeMode="contain"
                    accessibilityLabel={`Imagen ${index + 1} de ${images.length}`}
                  />
                </View>
              )}
            />
          )}
        </View>
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  viewport: { flex: 1 },
  image: { flex: 1, width: "100%" },
  exitButton: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
});
