import { useState } from 'react'
import {
  View,
  Text,
  Pressable,
  Image
} from 'react-native'
import { styles } from './styles/ImagesRoulette.style';

import { capitalizeFirstLetter } from '@/modules/users/main/utils/dashboard-formatters';
import { icons } from '@/assets';

const IMAGE_WIDTH = 90
const IMAGES_GAP = 6
const HORIZONTAL_PADDING = 8

type ImagesRoulleteProps = {
  images: string[],
  onBack: () => void,
  onFavorite: () => void,
  onShare: () => void,
  onOpenGallery: () => void,
  status: string
}

export const ImagesRoulette = ({
  images,
  onBack,
  onFavorite,
  onShare,
  onOpenGallery,
  status
}: ImagesRoulleteProps) => {
  const [imagesRowWidth, setImagesRowWidth] = useState(0)
  const [firstImage,  ...otherImages] = images
  const imageCount = images.length
  const availableWidth = imagesRowWidth - HORIZONTAL_PADDING * 2

  
  const visibleImagesCount = Math.max(
    1,
    Math.floor((availableWidth + IMAGES_GAP) / (IMAGE_WIDTH + IMAGES_GAP)),
  )
  
  const visibleImages = otherImages.slice(0, visibleImagesCount)
  
  const hiddenImagesCount = Math.max(
    0,
    imageCount - 1 - visibleImagesCount,
  );

  return(
    <View style={styles.container}>
      {firstImage ? (
        <View 
          style={styles.principalImageContainer}>
          <Image
            source={{ uri: firstImage }}
            style={styles.principalImage}
          />
          <View style={styles.statusContainer}>
            <Text
              numberOfLines={1}
              adjustsFontSizeToFit
              style={styles.statusText}
            >
              {capitalizeFirstLetter(status)}
            </Text>
          </View>
        </View>
      ): null}

      <View
        onLayout={(event) => setImagesRowWidth(event.nativeEvent.layout.width)}
        style={styles.scrollImagesContainer}
      >
        {visibleImages.map((image, index) => {
          const isLastVisibleImage = index === visibleImages.length - 1

          return (
          <Pressable
            accessibilityLabel={isLastVisibleImage ? `Abrir las ${imageCount} fotos` : undefined}
            accessibilityRole={isLastVisibleImage ? 'button' : undefined}
            disabled={!isLastVisibleImage}
            key={`${image}-${index}`}
            onPress={isLastVisibleImage ? onOpenGallery : undefined}
            style={styles.imagesContainer}
          >
            <Image
              source={{ uri: image }}
              style={styles.imagesInScroll}
            />

            {isLastVisibleImage ? (
              <View style={styles.imagesCountOverlay}>
                <Text style={styles.imagesCountText}>+ {hiddenImagesCount}</Text>
              </View>
            ) : null}
          </Pressable>
          )
        })}
      </View>

      <Pressable 
        onPress={onBack}
        style={[styles.buttonOverImage, styles.backButton]}
      >
        <icons.ArrowRight/>
      </Pressable>
      <View style={styles.leftButtonsContainer}>
        <Pressable onPress={onShare} style={styles.buttonOverImage}>
          <icons.Send width={25} height={25}/>
        </Pressable>
        <Pressable onPress={onFavorite} style={styles.buttonOverImage}>
          <icons.Heart width={25} height={25}/>
        </Pressable>
      </View>      
      
    </View>
  )
}
