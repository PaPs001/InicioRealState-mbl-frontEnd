import { View, Pressable } from "react-native";
import { styles } from "./styles/GalleryImages.styles";
import { useRef, useState } from "react";
import type { ViewToken, StyleProp, ImageStyle } from "react-native";
import { PropertyImage } from "./PropertyImage";
import { ImagePreviewModal } from "../ImagePreviewModal";
import { FlashList } from "@shopify/flash-list";
import { icons } from "@/assets";
type GalleryProps = {
  images: string[];
  onClose: () => void;
  onShare: () => void;
  onFavorite: () => void;
};

type GalleryPattern =
  | "twoColumns"
  | "threeColumns"
  | "fourBlocks"
  | "fourBlocksInverted";

type GalleryBlock = {
  pattern: GalleryPattern;
  images: string[];
};

const galleryPatterns = [
  {
    type: "threeColumns",
    count: 3,
  },
  {
    type: "twoColumns",
    count: 2,
  },
  {
    type: "fourBlocks",
    count: 4,
  },
  {
    type: "fourBlocksInverted",
    count: 4,
  },
] as const;

const createImageBlock = (images: string[]): GalleryBlock[] => {
  const blocks: GalleryBlock[] = [];

  let imageIndex = 0;
  let patternIndex = 0;

  while (imageIndex < images.length) {
    const pattern = galleryPatterns[patternIndex % galleryPatterns.length];

    const blockImages = images.slice(imageIndex, imageIndex + pattern.count);

    blocks.push({
      pattern: pattern.type,
      images: blockImages,
    });

    imageIndex += pattern.count;
    patternIndex++;
  }

  return blocks;
};
export const GalleryImages = ({
  images,
  onClose,
  onShare,
  onFavorite,
}: GalleryProps) => {
  const [mainImage, ...galleryImages] = images;
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const imageBlocks = createImageBlock(galleryImages);
  const [visibleBlocks, setVisibleBlocks] = useState<Set<number>>(new Set());
  const viewabilityConfig = useRef({ itemVisiblePercentThreshold: 1 }).current;
  const onViewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      setVisibleBlocks(
        new Set(
          viewableItems.flatMap((item) =>
            item.index === null ? [] : [item.index],
          ),
        ),
      );
    },
  ).current;

  return (
    <View style={styles.container}>
      <FlashList
        data={imageBlocks}
        extraData={visibleBlocks}
        viewabilityConfig={viewabilityConfig}
        onViewableItemsChanged={onViewableItemsChanged}
        ListHeaderComponent={
          mainImage ? (
            <GalleryPhoto
              uri={mainImage}
              onSelect={setSelectedImage}
              style={styles.mainImage}
            />
          ) : null
        }
        renderItem={({ item, index }) => (
          <GalleryBlock
            images={item.images}
            pattern={item.pattern}
            enabled={visibleBlocks.has(index)}
            onSelect={setSelectedImage}
          />
        )}
        keyExtractor={(_, index) => index.toString()}
      />
      <Pressable
        onPress={onClose}
        style={[styles.buttonOverImage, styles.backButton]}
      >
        <icons.ArrowRight />
      </Pressable>
      <View style={styles.leftButtonsContainer}>
        <Pressable onPress={onShare} style={styles.buttonOverImage}>
          <icons.Send width={25} height={25} />
        </Pressable>
        <Pressable onPress={onFavorite} style={styles.buttonOverImage}>
          <icons.Heart width={25} height={25} />
        </Pressable>
      </View>
      {selectedImage ? (
        <ImagePreviewModal
          images={images}
          initialIndex={Math.max(0, images.indexOf(selectedImage))}
          onClose={() => setSelectedImage(null)}
        />
      ) : null}
    </View>
  );
};

type GalleryBlockProps = {
  images: string[];
  pattern: GalleryPattern;
  enabled: boolean;
  onSelect: (uri: string) => void;
};

const GalleryBlock = ({
  images,
  pattern,
  enabled,
  onSelect,
}: GalleryBlockProps) => {
  const [topLeftImage, topRightImage, bottomLeftImage, bottomRightImage] =
    images;

  switch (pattern) {
    case "threeColumns":
      return (
        <View style={styles.threeColumns}>
          {images.map((image, index) => (
            <GalleryPhoto
              key={`${image}-${index}`}
              onSelect={onSelect}
              uri={image}
              enabled={enabled}
              style={styles.threeColumnImage}
            />
          ))}
        </View>
      );
    case "twoColumns":
      return (
        <View style={styles.twoColumns}>
          {images.map((image, index) => (
            <GalleryPhoto
              key={`${image}-${index}`}
              onSelect={onSelect}
              uri={image}
              enabled={enabled}
              style={styles.twoColumnImage}
            />
          ))}
        </View>
      );
    case "fourBlocks":
      return (
        <View style={styles.fourColumn}>
          <View style={styles.leftColumn}>
            <GalleryPhoto
              onSelect={onSelect}
              uri={topLeftImage}
              enabled={enabled}
              style={styles.topLeftImage}
            />
            <GalleryPhoto
              onSelect={onSelect}
              uri={bottomLeftImage}
              enabled={enabled}
              style={styles.bottomLeftImage}
            />
          </View>
          <View style={styles.rightColumn}>
            <GalleryPhoto
              onSelect={onSelect}
              uri={topRightImage}
              enabled={enabled}
              style={styles.topRightImage}
            />
            <GalleryPhoto
              onSelect={onSelect}
              uri={bottomRightImage}
              enabled={enabled}
              style={styles.bottomRightImage}
            />
          </View>
        </View>
      );
    case "fourBlocksInverted":
      return (
        <View style={styles.fourColumn}>
          <View style={styles.rightColumn}>
            <GalleryPhoto
              onSelect={onSelect}
              uri={topRightImage}
              enabled={enabled}
              style={styles.topRightImage}
            />
            <GalleryPhoto
              onSelect={onSelect}
              uri={bottomRightImage}
              enabled={enabled}
              style={styles.bottomRightImage}
            />
          </View>
          <View style={styles.leftColumn}>
            <GalleryPhoto
              onSelect={onSelect}
              uri={topLeftImage}
              enabled={enabled}
              style={styles.topLeftImage}
            />
            <GalleryPhoto
              onSelect={onSelect}
              uri={bottomLeftImage}
              enabled={enabled}
              style={styles.bottomLeftImage}
            />
          </View>
        </View>
      );
  }
};

function GalleryPhoto({
  uri,
  enabled = true,
  style,
  onSelect,
}: {
  uri?: string;
  enabled?: boolean;
  style: StyleProp<ImageStyle>;
  onSelect: (uri: string) => void;
}) {
  if (!uri) return null;
  return (
    <Pressable
      style={style}
      disabled={!enabled}
      accessibilityRole="button"
      accessibilityLabel="Ver imagen completa"
      onPress={() => onSelect(uri)}
    >
      <PropertyImage
        uri={uri}
        enabled={enabled}
        resizeMode="cover"
        style={{ width: "100%", height: "100%" }}
      />
    </Pressable>
  );
}
