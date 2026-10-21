import { useEffect, useRef, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { FlatList } from "react-native-gesture-handler";
import type { PropertyDetailRoom } from "../../mappers/detail.mappers";
import { ImagePreviewModal } from "../ImagePreviewModal";
import { PropertyImage } from "./PropertyImage";
import { styles } from "./styles/RoomsRow.style";

export function PropertyCarousel({ items }: { items: PropertyDetailRoom[] }) {
  const listRef = useRef<FlatList<PropertyDetailRoom>>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const currentIndex = useRef(0);
  const [listWidth, setListWidth] = useState(0);
  const LIST_PADDING = 10;
  const GAP = 12;
  const cardWidth = Math.max(0, (listWidth - LIST_PADDING * 2 - GAP) / 2);
  const step = cardWidth + GAP;

  const previewImages = items.flatMap((item) => item.images.length ? item.images : [item.image]);
  const lastIndex = Math.max(0, items.length - 2);

  useEffect(() => {
    currentIndex.current = 0;
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [step, lastIndex]);

  useEffect(() => {
    if (cardWidth <= 0 || lastIndex === 0 || selectedIndex !== null) return;

    const interval = setInterval(() => {
      const nextIndex =
        currentIndex.current >= lastIndex
          ? 0
          : Math.min(currentIndex.current + 2, lastIndex);
      currentIndex.current = nextIndex;
      listRef.current?.scrollToOffset({
        offset: nextIndex * step,
        animated: true,
      });
    }, 7000);

    return () => clearInterval(interval);
  }, [cardWidth, lastIndex, step, selectedIndex]);

  return (
    <View
      style={{ paddingHorizontal: LIST_PADDING }}
      onLayout={({ nativeEvent }) => setListWidth(nativeEvent.layout.width)}
    >
      {cardWidth > 0 && (
        <FlatList
          ref={listRef}
          data={items}
          extraData={cardWidth}
          horizontal
          snapToInterval={step}
          snapToAlignment="start"
          decelerationRate="fast"
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
          onMomentumScrollEnd={({ nativeEvent }) => {
            currentIndex.current = Math.max(
              0,
              Math.min(
                Math.round(nativeEvent.contentOffset.x / step),
                lastIndex,
              ),
            );
          }}
          renderItem={({ item, index }) => (
            <Pressable
              style={[styles.roomCard, { width: cardWidth }]}
              onPress={() => setSelectedIndex(index)}
              accessibilityRole="button"
              accessibilityLabel={`Ver imagen de ${item.name}`}
            >
              <PropertyImage
                uri={item.image}
                enabled
                style={styles.roomImage}
              />
              <View style={styles.roomTextContainer}>
                <Text style={styles.roomTitle}>{item.name}</Text>
              </View>
            </Pressable>
          )}
        />
      )}
      {selectedIndex !== null && (
        <ImagePreviewModal
          images={previewImages}
          initialIndex={items.slice(0, selectedIndex).reduce(
            (count, item) => count + Math.max(1, item.images.length), 0,
          )}
          onClose={() => setSelectedIndex(null)}
        />
      )}
    </View>
  );
}

